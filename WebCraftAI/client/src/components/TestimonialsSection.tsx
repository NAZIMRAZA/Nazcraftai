export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Yoga Instructor",
      content: "I created a beautiful website for my yoga studio in just minutes. The AI understood exactly what I needed!",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      rating: 5,
      date: "2 days ago"
    },
    {
      id: 2,
      name: "Michael Lee",
      role: "Freelance Photographer",
      content: "As a photographer, I needed a portfolio that would showcase my work. WebCraft AI delivered exactly what I needed!",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 4.5,
      date: "1 week ago"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Small Business Owner",
      content: "I had no idea how to make a website for my bakery. This tool made it so easy - now I have an online presence!",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
      date: "3 days ago"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          What People are Creating
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={`${testimonial.name}'s avatar`} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
              <div className="flex justify-between items-center">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <i 
                      key={index}
                      className={`fas ${
                        index < Math.floor(testimonial.rating) 
                          ? 'fa-star' 
                          : index === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0 
                          ? 'fa-star-half-alt' 
                          : 'fa-star text-gray-300'
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
