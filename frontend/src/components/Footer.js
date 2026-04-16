import React from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
  House,
  ShoppingBag,
  ShoppingCart,
  LogIn,
  UserPlus
} from "lucide-react";

const categories = [
  "Microcontrollers",
  "Sensors & Modules",
  "Robotics & Motors",
  "Development Boards",
  "Electronic Components",
  "3D Printing",
  "IoT & Wireless Modules"
];

const quickLinks = [
  { to: "/", label: "Home", icon: House },
  { to: "/products", label: "All Products", icon: ShoppingBag },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/login", label: "Login", icon: LogIn },
  { to: "/register", label: "Register", icon: UserPlus }
];

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com/buildoreo",
    icon: Instagram
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@buildoreo",
    icon: Youtube
  },
  {
    name: "Twitter",
    href: "https://twitter.com/buildoreo",
    icon: Twitter
  },
  {
    name: "Facebook",
    href: "https://facebook.com/buildoreo",
    icon: Facebook
  }
];

const Footer = () => {
  const email = "supportbuildoreo@gmail.com";
  const phone = "+917052924672";
  const displayPhone = "+91 7052924672";
  const address = "DARAGANJ, ALLAHABAD, UTTAR PRADESH 211003";
  const mapsQuery = encodeURIComponent(address);

  return (
    <footer className="bg-card border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <div className="w-9 h-9 bg-primary rounded-sm flex items-center justify-center shadow-[0_0_18px_rgba(250,204,21,0.18)]">
                <Cpu size={17} className="text-black" />
              </div>
              <span
                className="text-xl font-extrabold text-white group-hover:text-primary transition-colors"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <span className="text-primary">Buildoreo</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-8 mb-5 max-w-xs">
              India's premier destination for electronics, microcontrollers,
              and maker components.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.name}
                    className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-white/10 transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest text-white mb-5"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Categories
            </h4>

            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-primary transition-all duration-200"
                  >
                    <ChevronRight
                      size={14}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                    />
                    <span>{cat}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest text-white mb-5"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Quick Links
            </h4>

            <ul className="space-y-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-primary transition-all duration-200"
                    >
                      <span className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                        <Icon size={14} />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-sm font-bold uppercase tracking-widest text-white mb-5"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Contact
            </h4>

            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-primary transition-all duration-200"
                >
                  <span className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                    <Mail size={14} className="text-primary" />
                  </span>
                  <span className="break-all">{email}</span>
                </a>
              </li>

              <li>
                <a
                  href={`tel:${phone}`}
                  className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-primary transition-all duration-200"
                >
                  <span className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                    <Phone size={14} className="text-primary" />
                  </span>
                  <span>{displayPhone}</span>
                </a>
              </li>

              <li>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-primary transition-all duration-200"
                >
                  <span className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center mt-0.5 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-200">
                    <MapPin size={14} className="text-primary" />
                  </span>
                  <span>{address}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Buildoreo. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secure payments powered by Razorpay
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
