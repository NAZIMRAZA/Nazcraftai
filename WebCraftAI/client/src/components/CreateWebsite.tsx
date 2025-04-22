import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { websiteTemplates } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import TemplateHelpModal from "./TemplateHelpModal";
import WebsitePreview from "./WebsitePreview";

enum Step {
  Prompt = "prompt",
  Generating = "generating",
  Preview = "preview"
}

export default function CreateWebsite() {
  const [step, setStep] = useState<Step>(Step.Prompt);
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generatedWebsite, setGeneratedWebsite] = useState<any>(null);
  const [showTemplateHelp, setShowTemplateHelp] = useState(false);
  const { toast } = useToast();

  // Load saved prompt from localStorage if available
  useEffect(() => {
    const savedPrompt = localStorage.getItem("selectedPrompt");
    if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem("selectedPrompt"); // Clear after using
    }
  }, []);

  // Website generation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; templateId: string }) => {
      const response = await apiRequest("POST", "/api/websites", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedWebsite(data);
      setStep(Step.Preview);
      toast({
        title: "Website generated!",
        description: "Your website has been successfully created.",
      });
    },
    onError: (error) => {
      setStep(Step.Prompt);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your website before generating.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Template required",
        description: "Please select a template type for your website.",
        variant: "destructive",
      });
      return;
    }

    setStep(Step.Generating);
    generateMutation.mutate({ prompt, templateId: selectedTemplate });
  };

  const handleRegenerateWebsite = () => {
    setStep(Step.Generating);
    generateMutation.mutate({ prompt, templateId: selectedTemplate });
  };

  const handleBackToPrompt = () => {
    setStep(Step.Prompt);
  };

  return (
    <section id="create" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Create Your Website
        </h2>
        
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {/* Step 1: Prompt Input */}
          {step === Step.Prompt && (
            <div id="step-prompt" className="step">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Describe Your Website</h3>
              <p className="text-gray-600 mb-6">Tell us what you want your website to be about. The more details you provide, the better the result.</p>
              
              <div className="mb-6">
                <label htmlFor="website-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Website Description
                </label>
                <textarea 
                  id="website-prompt" 
                  rows={5} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                  placeholder="Example: Create a professional website for my photography business with a gallery, about page, pricing information, and contact form. Use dark colors with accent of orange."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Choose Template Type</label>
                <button 
                  className="text-sm text-primary-600 hover:text-primary-700"
                  onClick={() => setShowTemplateHelp(true)}
                >
                  <i className="far fa-question-circle mr-1"></i> What's this?
                </button>
              </div>
              
              {/* Template Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8" id="templates">
                {websiteTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className={`template-card relative rounded-lg border-2 ${
                      selectedTemplate === template.id 
                        ? "border-primary-500" 
                        : "border-gray-200 hover:border-primary-300"
                    } cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <img 
                      src={`https://images.unsplash.com/photo-${template.id === "minimalist" 
                        ? "1579403124614-197f69d8187b" 
                        : template.id === "modern" 
                        ? "1460925895917-afdab827c52f"
                        : template.id === "business"
                        ? "1486406146926-c627a92ad1ab"
                        : "1545239351-ef35f43d514b"
                      }?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=150&q=80`} 
                      alt={`${template.name} template`} 
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </div>
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                      {selectedTemplate === template.id && (
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  className="py-3 px-6 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-md flex items-center"
                  onClick={handleGenerate}
                >
                  <span>Generate Website</span>
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Generation */}
          {step === Step.Generating && (
            <div id="step-generating" className="step">
              <div className="text-center py-10">
                <div className="w-24 h-24 mx-auto mb-8 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-opacity-30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Crafting Your Website</h3>
                <p className="text-gray-600 animate-pulse">Our AI is building your website...</p>
                
                <div className="max-w-md mx-auto mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Analyzing your prompt</span>
                      <span className="text-xs text-green-600">Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Designing layout</span>
                      <span className="text-xs text-primary-600">In progress</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Generating content</span>
                      <span className="text-xs text-gray-500">Waiting</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Finalizing website</span>
                      <span className="text-xs text-gray-500">Waiting</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gray-300 h-1.5 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Preview & Customize */}
          {step === Step.Preview && generatedWebsite && (
            <WebsitePreview 
              website={generatedWebsite}
              onRegenerate={handleRegenerateWebsite}
              onBack={handleBackToPrompt}
            />
          )}
        </div>
      </div>
      
      {/* Template Help Modal */}
      <TemplateHelpModal 
        isOpen={showTemplateHelp} 
        onClose={() => setShowTemplateHelp(false)} 
      />
    </section>
  );
}
