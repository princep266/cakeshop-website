import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cake-brown text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-3xl">🎂</div>
              <h3 className="text-2xl font-bold">The Noisy Cake Shop</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              We create delicious, handcrafted cakes and pastries that bring joy to every celebration. 
              From birthdays to weddings, we make every moment special with our sweet creations.
            </p>
            
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-gray-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/pastries" className="text-gray-300 hover:text-white transition-colors">
                  Pastries
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-gray-300 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cake-red" />
                <span className="text-gray-300">123 Baker Street, Sweet City</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-cake-red" />
                <span className="text-gray-300">+91 7208327881</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-cake-red" />
                <span className="text-gray-300">princeprajapati8392@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 The Noisy Cake Shop. All rights reserved. Made with ❤️ for sweet moments.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
