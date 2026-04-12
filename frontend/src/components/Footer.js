import React from "react";
import { Link } from "react-router-dom";
import { Cpu, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => (
  <footer className="bg-card border-t border-white/10 mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <Cpu size={16} className="text-black" />
            </div>
            <span className="text-lg font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Build<span className="text-primary">oreo</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            India's premier destination for electronics, microcontrollers, and maker components.
          </p>
          <div className="flex gap-3">
            <a href="#" className="p-2 bg-white/5 border border-white/10 rounded-md text-gray-500 hover:text-primary hover:border-primary/30 transition-colors">
              <Github size={14} />
            </a>
            <a href="#" className="p-2 bg-white/5 border border-white/10 rounded-md text-gray-500 hover:text-primary hover:border-primary/30 transition-colors">
              <Twitter size={14} />
            </a>
            <a href="#" className="p-2 bg-white/5 border border-white/10 rounded-md text-gray-500 hover:text-primary hover:border-primary/30 transition-colors">
              <Linkedin size={14} />
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Categories</h4>
          <ul className="space-y-2">
            {["Microcontrollers", "Sensors & Modules", "Robotics & Motors", "Development Boards", "Electronic Components", "3D Printing", "IoT & Wireless Modules"].map(cat => (
              <li key={cat}>
                <Link to={`/products?category=${encodeURIComponent(cat)}`} className="text-sm text-gray-500 hover:text-primary transition-colors">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Links</h4>
          <ul className="space-y-2">
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "All Products" },
              { to: "/cart", label: "Cart" },
              { to: "/login", label: "Login" },
              { to: "/register", label: "Register" },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-gray-500 hover:text-primary transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-sm text-gray-500">
              <Mail size={14} className="text-primary flex-shrink-0" />
              support@buildoreo.com
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={14} className="text-primary flex-shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
              Bangalore, Karnataka, India - 560001
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Buildoreo. All rights reserved.
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Secure payments powered by Razorpay
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
