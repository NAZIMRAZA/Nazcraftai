export default function CallToAction() {
  const scrollToCreate = () => {
    document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to Create Your Own Website?</h2>
        <p className="text-lg md:text-xl opacity-90 mb-8">No coding required. No credit card needed. Just your creativity.</p>
        <button
          onClick={scrollToCreate}
          className="inline-block py-3 px-8 bg-white text-primary-700 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md"
        >
          Get Started Now
        </button>
      </div>
    </section>
  );
}
