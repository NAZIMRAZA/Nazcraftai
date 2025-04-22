import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { colorSchemes, fontStyles } from "@shared/schema";

interface WebsitePreviewProps {
  website: any;
  onRegenerate: () => void;
  onBack: () => void;
}

export default function WebsitePreview({ website, onRegenerate, onBack }: WebsitePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedColor, setSelectedColor] = useState(website.content.colorScheme || "primary");
  const [selectedFont, setSelectedFont] = useState(website.content.fontStyle || "modern");
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/websites/${website.id}/download`);
      
      if (!response.ok) {
        throw new Error('Failed to download website');
      }
      
      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `website-${website.id}.zip`;

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Website Source Code Downloaded!",
        description: "Your website files have been successfully downloaded. The ZIP file contains all HTML, CSS, and JavaScript source code.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error 
          ? error.message 
          : "Unable to download the source code. Please try again or check your connection. If the issue persists, try clicking the Download button again.",
        variant: "destructive",
      });
    }
  };

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
    toast({
      title: "Color updated",
      description: "Color scheme has been updated in the preview.",
    });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFont(e.target.value);
    toast({
      title: "Font updated",
      description: "Font style has been updated in the preview.",
    });
  };

  const handleFullPreview = () => {
    // Open a new window with the preview
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Website Preview</title>
            <style>${website.css}</style>
          </head>
          <body>
            ${website.html}
          </body>
        </html>
      `);
      previewWindow.document.close();
    } else {
      toast({
        title: "Preview blocked",
        description: "Please allow pop-ups to see the full preview.",
        variant: "destructive",
      });
    }
  };

  return (
    <div id="step-preview" className="step">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Website Preview</h3>
        <div>
          <button 
            className="mr-3 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all hover:shadow-md"
            onClick={onRegenerate}
          >
            <span className="flex items-center">
              <i className="fas fa-redo-alt mr-2"></i> Regenerate
            </span>
          </button>
          <button 
            className="py-2 px-5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md relative overflow-hidden group"
            onClick={handleDownload}
          >
            <span className="relative z-10 flex items-center">
              <i className="fas fa-download mr-2"></i> Download Source Code
              <i className="fas fa-code ml-2 opacity-70"></i>
            </span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              New
            </span>
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Website preview header */}
        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="flex space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
          <div className="w-1/2">
            <div className="border border-gray-300 rounded-md px-3 py-1 flex items-center bg-white">
              <i className="fas fa-lock text-gray-400 text-xs mr-2"></i>
              <span className="text-xs text-gray-600 truncate">https://your-website.com</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${previewMode === 'desktop' ? 'bg-gray-200' : 'hover:bg-gray-200'} transition-colors`}
              onClick={() => setPreviewMode('desktop')}
            >
              <i className="fas fa-desktop text-gray-600"></i>
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${previewMode === 'tablet' ? 'bg-gray-200' : 'hover:bg-gray-200'} transition-colors`}
              onClick={() => setPreviewMode('tablet')}
            >
              <i className="fas fa-tablet-alt text-gray-600"></i>
            </button>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-md ${previewMode === 'mobile' ? 'bg-gray-200' : 'hover:bg-gray-200'} transition-colors`}
              onClick={() => setPreviewMode('mobile')}
            >
              <i className="fas fa-mobile-alt text-gray-600"></i>
            </button>
          </div>
        </div>
        
        {/* Website preview content */}
        <div 
          className="bg-white h-[500px] overflow-hidden relative"
          style={{
            maxWidth: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
            margin: '0 auto'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="mb-2">
                <span className="inline-block p-3 rounded-full bg-green-100 text-green-500 mb-4">
                  <i className="fas fa-check-circle text-4xl"></i>
                </span>
              </div>
              <h4 className="text-2xl font-semibold text-gray-800 mb-2">Your website is ready!</h4>
              <p className="text-gray-600 mb-6">Your custom website has been successfully generated. You can preview it or download the source code.</p>
              
              <div className="flex flex-col space-y-3">
                <button 
                  className="py-3 px-6 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-md relative overflow-hidden group w-full"
                  onClick={handleFullPreview}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <i className="fas fa-eye mr-2"></i> Full Preview
                    <i className="fas fa-external-link-alt ml-2 text-sm"></i>
                  </span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </button>
                
                <button 
                  className="py-3 px-6 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-md relative overflow-hidden group w-full"
                  onClick={handleDownload}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <i className="fas fa-download mr-2"></i> Download Source Code
                    <i className="fas fa-code ml-2 text-sm"></i>
                  </span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customization options */}
      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Customizations</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
            <div className="flex space-x-3 mb-4">
              {colorSchemes.map((scheme) => (
                <span
                  key={scheme.id} 
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor === scheme.id ? 'border-gray-600 scale-110 shadow-md' : 'border-white'
                  } shadow-sm cursor-pointer hover:scale-110 hover:shadow-md transition-all duration-300 relative group`}
                  style={{ backgroundColor: scheme.color }}
                  onClick={() => handleColorChange(scheme.id)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow cursor-pointer hover:shadow-md"
              value={selectedFont}
              onChange={handleFontChange}
            >
              {fontStyles.map((font) => (
                <option key={font.id} value={font.id}>{font.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <button 
          className="py-2 px-5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all hover:shadow-md"
          onClick={onBack}
        >
          <span className="flex items-center">
            <i className="fas fa-arrow-left mr-2"></i> Back to Editor
          </span>
        </button>
        <button 
          className="py-3 px-8 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all shadow-md relative overflow-hidden group transform hover:scale-105"
          onClick={handleDownload}
        >
          <span className="relative z-10 flex items-center">
            <i className="fas fa-check mr-2"></i> Download Website Source Code
            <i className="fas fa-download ml-2"></i>
          </span>
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-green-300"></span>
        </button>
      </div>
    </div>
  );
}
