import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Cpu, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = ["Microcontrollers", "Sensors & Modules", "Robotics & Motors", "Development Boards", "Electronic Components", "3D Printing", "IoT & Wireless Modules"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setUserOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg" : "bg-black/80 backdrop-blur-sm"
      } border-b border-white/10`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <Cpu size={18} className="text-black" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-primary transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Build<span className="text-primary">oreo</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
            <div className="relative">
              <button
                onClick={() => setCatOpen(!catOpen)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                data-testid="categories-dropdown"
              >
                Categories <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-md bg-card border border-white/10 shadow-xl z-50 overflow-hidden">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-muted hover:text-primary transition-colors"
                      data-testid={`category-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/products" className="text-sm text-gray-400 hover:text-white transition-colors">All Products</Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="w-64 bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 rounded-l-md px-4 py-2 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                data-testid="search-input"
              />
              <button
                type="submit"
                className="bg-primary text-black px-3 py-2 rounded-r-md hover:bg-yellow-400 transition-colors"
                data-testid="search-button"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 text-gray-400 hover:text-primary transition-colors"
              data-testid="cart-icon"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center" data-testid="cart-count">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-white/5 transition-colors"
                  data-testid="user-menu-button"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <span className="text-primary text-sm font-bold">{user.name[0].toUpperCase()}</span>
                  </div>
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-card border border-white/10 shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-muted hover:text-primary transition-colors" data-testid="admin-link">
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                     <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-muted hover:text-primary"
                    >
                      My Account
                    </Link>

                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-muted hover:text-primary"
                    >
                      My Orders
                    </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-muted hover:text-destructive transition-colors"
                      data-testid="logout-button"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold bg-primary text-black px-4 py-1.5 rounded-md hover:bg-yellow-400 transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                data-testid="login-button"
              >
                <User size={14} /> Login
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              data-testid="mobile-menu-button"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 px-3 py-2 rounded-l-md focus:outline-none focus:border-primary/50"
              />
              <button type="submit" className="bg-primary text-black px-3 py-2 rounded-r-md">
                <Search size={14} />
              </button>
            </form>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="block text-sm text-gray-400 hover:text-primary transition-colors py-1">
                {cat}
              </Link>
            ))}
            {!user && (
              <Link to="/login" className="block text-sm font-semibold text-primary py-1">Login / Sign Up</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
