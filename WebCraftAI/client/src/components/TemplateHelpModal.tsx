interface TemplateHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateHelpModal({ isOpen, onClose }: TemplateHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">About Templates</h3>
          <button className="text-gray-400 hover:text-gray-500" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-5">
          <p className="text-gray-600 mb-4">Templates provide a starting structure for your website. Choose the one that best matches your needs:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2"></i>
              <div>
                <strong className="text-gray-900">Minimalist:</strong>
                <span className="text-gray-600"> Clean design with focus on content. Great for portfolios, blogs, and personal sites.</span>
              </div>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2"></i>
              <div>
                <strong className="text-gray-900">Modern:</strong>
                <span className="text-gray-600"> Bold visuals and contemporary layouts. Perfect for startups and creative businesses.</span>
              </div>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2"></i>
              <div>
                <strong className="text-gray-900">Business:</strong>
                <span className="text-gray-600"> Professional structure with sections for services, team, and contact. Ideal for companies and organizations.</span>
              </div>
            </li>
            <li className="flex items-start">
              <i className="fas fa-check-circle text-primary-500 mt-1 mr-2"></i>
              <div>
                <strong className="text-gray-900">Creative:</strong>
                <span className="text-gray-600"> Unique layouts with artistic elements. Great for artists, designers, and creative professionals.</span>
              </div>
            </li>
          </ul>
          <p className="text-gray-600">Don't worry too much about your choice - our AI will adapt the template based on your description.</p>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button 
            className="w-full py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
