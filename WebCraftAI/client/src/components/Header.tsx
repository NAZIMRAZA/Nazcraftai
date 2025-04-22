import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-magic text-primary-500 text-2xl"></i>
          <h1 className="text-xl font-semibold text-gray-800">NazCraft AI</h1>
          <div className="text-sm text-gray-600">Built by NazCorp</div>
        </div>

        <nav className="hidden md:flex space-x-8">
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
            How It Works
          </a>
          <a href="#examples" className="text-gray-600 hover:text-gray-900">
            Examples
          </a>
          <a href="#create" className="text-gray-600 hover:text-gray-900">
            Templates
          </a>
        </nav>

        <button 
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <a 
              href="#how-it-works" 
              className="block py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#examples" 
              className="block py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Examples
            </a>
            <a 
              href="#create" 
              className="block py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Templates
            </a>
          </div>
        </div>
      )}
    </header>
  );
}