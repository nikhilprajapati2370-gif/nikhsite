import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Truck, Headphones, ChevronRight, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const HERO_BG = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80";

const CATEGORIES = [
  { name: "Microcontrollers", image: "https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?w=400&q=80", desc: "Arduino, Raspberry Pi & more" },
  { name: "Sensors & Modules", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80", desc: "Ultrasonic, DHT, MPU & more" },
  { name: "Robotics & Motors", image: "https://images.pexels.com/photos/8438863/pexels-photo-8438863.jpeg?auto=compress&cs=tinysrgb&w=400", desc: "Servo, Stepper, DC motors" },
  { name: "Development Boards", image: "https://images.pexels.com/photos/10635975/pexels-photo-10635975.jpeg?auto=compress&cs=tinysrgb&w=400", desc: "ESP32, NodeMCU, STM32" },
  { name: "Electronic Components", image: "https://images.pexels.com/photos/159201/circuit-circuit-board-resistor-computer-159201.jpeg?auto=compress&cs=tinysrgb&w=400", desc: "Resistors, LEDs, Breadboards" },
  { name: "3D Printing", image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400", desc: "PLA, ABS, PETG filaments" },
  { name: "IoT & Wireless Modules", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80", desc: "Bluetooth, WiFi, LoRa, GSM" },
];

const FEATURES = [
  { icon: Zap, title: "Fast Delivery", desc: "Nationwide delivery within 2-5 days" },
  { icon: Shield, title: "Genuine Products", desc: "100% authentic components guaranteed" },
  { icon: Truck, title: "Free Shipping", desc: "Free shipping on orders above ₹999" },
  { icon: Headphones, title: "24/7 Support", desc: "Technical support from our experts" },
];

const Particles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 6}s`,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
      {/* Circuit lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M20 0 L20 20 L40 20 L40 0" fill="none" stroke="#FACC15" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="2" fill="#FACC15" opacity="0.5" />
            <path d="M0 40 L20 40 L20 60 L40 60 L40 80" fill="none" stroke="#FACC15" strokeWidth="0.5" />
            <circle cx="20" cy="40" r="2" fill="#FACC15" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );
};

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then(res => {
      setFeaturedProducts(res.data.products || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
        <Particles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              India's #1 Electronics Store
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-none"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Build.
              <br />
              <span className="text-primary text-glow-yellow">Create.</span>
              <br />
              Innovate.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-base text-gray-400 max-w-md leading-relaxed"
            >
              Premium microcontrollers, sensors, robotics components, and maker supplies. Everything your project needs, delivered to your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button
                onClick={() => navigate("/products")}
                className="btn-primary flex items-center gap-2 px-8 py-3 rounded-md text-sm font-bold"
                data-testid="hero-shop-now"
              >
                Shop Now <ArrowRight size={16} />
              </button>
              <button
                onClick={() => document.getElementById("categories-section").scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 border border-white/20 text-white px-8 py-3 rounded-md text-sm font-semibold hover:border-primary hover:text-primary transition-all"
              >
                Explore Categories
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 flex gap-8"
            >
              {[["10,000+", "Products"], ["50,000+", "Customers"], ["99%", "Satisfaction"]].map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-0.5 h-10 bg-gradient-to-b from-transparent to-primary/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-card border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories-section" className="py-16 circuit-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Browse by Category</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Shop <span className="text-primary">Categories</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative overflow-hidden rounded-lg border border-white/10 block aspect-square"
                  data-testid={`category-card-${i}`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=60"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                    <div className="flex items-center gap-1 mt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold">Explore</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                  {/* Neon border effect on hover */}
                  <div className="absolute inset-0 rounded-lg border-2 border-primary/0 group-hover:border-primary/40 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
            {/* View All Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: CATEGORIES.length * 0.08 }}
              viewport={{ once: true }}
            >
              <Link
                to="/products"
                className="group relative overflow-hidden rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center aspect-square hover:bg-primary/10 transition-colors"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/40 flex items-center justify-center mx-auto mb-3">
                    <ArrowRight size={20} className="text-primary" />
                  </div>
                  <p className="text-sm font-bold text-primary" style={{ fontFamily: 'Outfit, sans-serif' }}>View All</p>
                  <p className="text-xs text-gray-500 mt-1">All Products</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Top Picks</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Featured <span className="text-primary">Products</span>
              </h2>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-sm text-primary hover:text-yellow-400 transition-colors font-semibold">
              View All <ChevronRight size={16} />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-12"
          >
            <div className="absolute inset-0 circuit-bg opacity-30" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2 block">Limited Time</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Free Shipping on Orders <span className="text-primary">Above ₹999</span>
                </h3>
                <p className="text-sm text-gray-400 mt-2">Use code: <span className="text-primary font-mono font-bold">BUILD2024</span> at checkout</p>
              </div>
              <button
                onClick={() => navigate("/products")}
                className="btn-primary flex items-center gap-2 px-8 py-3 rounded-md text-sm font-bold whitespace-nowrap"
              >
                Shop Now <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-card border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our Commitment</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Why <span className="text-primary">Buildoreo?</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Quality Assured", desc: "Every product goes through rigorous quality checks. We source directly from manufacturers.", icon: "🔬", stat: "100%" },
              { title: "Expert Support", desc: "Our team of engineers and makers are available to help you with technical queries.", icon: "🛠", stat: "24/7" },
              { title: "Fast Dispatch", desc: "Orders placed before 2PM are dispatched same day. Pan India delivery available.", icon: "📦", stat: "Same Day" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="p-6 bg-background border border-white/10 rounded-lg hover:border-primary/30 transition-colors group"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.stat}</div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
