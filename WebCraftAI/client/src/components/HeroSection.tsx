export default function HeroSection() {
  const scrollToCreate = () => {
    document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToExamples = () => {
    document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-primary-50 to-gray-50 px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
          Create Beautiful Websites<br />With Simple Prompts
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          No coding. No design skills. Just describe what you want,<br />
          and our AI will build it for you. Completely free.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={scrollToCreate}
            className="py-3 px-6 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-md"
          >
            Create Your Website
          </button>
          <button
            onClick={scrollToExamples}
            className="py-3 px-6 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-200"
          >
            See Examples
          </button>
        </div>
      </div>
    </section>
  );
}
