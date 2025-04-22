import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExamplePrompt {
  id: number;
  category: string;
  title: string;
  prompt: string;
  image: string;
}

const examples: ExamplePrompt[] = [
  {
    id: 1,
    category: "Business",
    title: "Coffee Shop Website",
    prompt: "Create a website for my coffee shop with a menu section, about us page, and contact information. I want a warm color scheme with browns and creams.",
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80"
  },
  {
    id: 2,
    category: "Personal",
    title: "Personal Portfolio",
    prompt: "Make a modern portfolio website for a graphic designer with project showcases and a contact form. Use a minimal design with lots of whitespace.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80"
  },
  {
    id: 3,
    category: "Startup",
    title: "SaaS Landing Page",
    prompt: "Design a landing page for my productivity app with features list, pricing plans, and newsletter signup. Use a bold, colorful design that feels energetic.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=300&q=80"
  }
];

export default function ExamplesSection() {
  const createSectionRef = useRef<HTMLElement | null>(null);
  const { toast } = useToast();
  
  const handleUsePrompt = (example: ExamplePrompt) => {
    // Set the prompt in localStorage so it can be used in the CreateWebsite component
    localStorage.setItem('selectedPrompt', example.prompt);
    
    // Scroll to create section
    createSectionRef.current = document.getElementById('create');
    createSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    toast({
      title: "Example selected",
      description: `Using "${example.title}" as your starting point.`,
    });
  };

  return (
    <section id="examples" className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">Example Prompts</h2>
        <p className="text-center text-gray-600 mb-12">See what's possible with simple prompts</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => (
            <div 
              key={example.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={example.image} 
                  alt={`${example.title} example`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded mb-3">{example.category}</span>
                <h3 className="font-medium text-lg text-gray-900 mb-2">{example.title}</h3>
                <p className="text-gray-600 text-sm mb-4">"{example.prompt}"</p>
                <button 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  onClick={() => handleUsePrompt(example)}
                >
                  <span>Use this prompt</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
