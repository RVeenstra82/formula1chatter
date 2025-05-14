import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-f1-dark text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-f1-red font-bold">F1</span> Chatter Championship &copy; {new Date().getFullYear()}
          </div>
          <div className="flex space-x-4">
            <Link to="/privacy-policy" className="hover:text-f1-red transition-colors">
              Privacy Policy
            </Link>
            <Link to="/data-deletion" className="hover:text-f1-red transition-colors">
              Data Deletion
            </Link>
            <a 
              href="https://github.com/yourusername/formula1chatter" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-f1-red transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 