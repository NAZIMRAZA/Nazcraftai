export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4">
              <i className="fas fa-pencil-alt text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Describe Your Website</h3>
            <p className="text-gray-600">Write a simple prompt describing your website's purpose, content and style.</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4">
              <i className="fas fa-wand-magic-sparkles text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Does the Work</h3>
            <p className="text-gray-600">Our AI analyzes your description and generates a fully functional website design.</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4">
              <i className="fas fa-download text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Download & Use</h3>
            <p className="text-gray-600">Preview your website, make adjustments, and download the files ready to publish.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
