import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Cpu,
  LogOut,
  LayoutDashboard,
  Package,
  Heart,
  Repeat,
  UserCircle,
  ClipboardList
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  "Microcontrollers",
  "Sensors & Modules",
  "Robotics & Motors",
  "Development Boards",
  "Electronic Components",
  "3D Printing",
  "IoT & Wireless Modules"
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setUserOpen(false);
    setMobileSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const closeMenus = (e) => {
      const dropdown = document.getElementById("navbar-dropdown-wrap");
      if (dropdown && !dropdown.contains(e.target)) {
        setCatOpen(false);
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);
    return () => document.removeEventListener("mousedown", closeMenus);
  }, []);

  const runSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return false;

    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    setMobileOpen(false);
    setMobileSearchOpen(false);
    return true;
  };

  const handleDesktopSubmit = (e) => {
    e.preventDefault();
    if (!runSearch(searchQuery) && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleDesktopButtonClick = () => {
    if (!runSearch(searchQuery) && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (!runSearch(searchQuery) && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  };

  const handleMobileSearchIconClick = () => {
    if (!mobileSearchOpen) {
      setMobileSearchOpen(true);
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
      return;
    }

    if (!runSearch(searchQuery) && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  };

  const handleLogout = () => {
    setUserOpen(false);
    logout();
    navigate("/");
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 transition-all duration-300 ${scrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-black/85 backdrop-blur-sm"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="navbar-dropdown-wrap">
        <div className="h-16 flex items-center justify-between gap-3">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
              <div className="w-9 h-9 bg-primary rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.25)]">
                <Cpu size={18} className="text-black" />
              </div>
              <span
                className="text-xl font-extrabold tracking-tight text-primary group-hover:text-yellow-300 transition-colors"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Buildoreo
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-7 shrink-0">
            <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setCatOpen((prev) => !prev)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                data-testid="categories-dropdown"
                type="button"
              >
                Categories
                <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>

              {catOpen && (
                <div className="absolute top-full left-0 mt-3 w-60 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
              All Products
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center px-2">
            <form
              onSubmit={handleDesktopSubmit}
              className="w-full max-w-md"
            >
              <div className="flex items-stretch w-full rounded-lg overflow-hidden border border-white/10 bg-white/5 focus-within:border-primary/60 focus-within:bg-white/[0.07] transition-all">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="flex-1 min-w-0 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
                  data-testid="search-input"
                />
                <button
                  type="submit"
                  onClick={handleDesktopButtonClick}
                  className="w-14 shrink-0 flex items-center justify-center bg-primary text-black hover:bg-yellow-400 transition-colors"
                  data-testid="search-button"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleMobileSearchIconClick}
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            <Link
              to="/cart"
              className="relative w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors"
              data-testid="cart-icon"
            >
              <ShoppingCart size={21} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0 min-w-[18px] h-[18px] px-1 bg-primary text-black text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserOpen((prev) => !prev)}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors"
                  data-testid="user-menu-button"
                  aria-label="User menu"
                >
                  <User size={19} />
                </button>

                {userOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      <ClipboardList size={15} />
                      My Orders
                    </Link>

                    <Link
                      to="/my-account"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      <UserCircle size={15} />
                      My Account
                    </Link>

                    <Link
                      to="/my-list"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      <Heart size={15} />
                      My List
                    </Link>

                    <Link
                      to="/buy-again"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      <Repeat size={15} />
                      Buy Again
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-primary transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-red-400 transition-colors text-left"
                    >
                      <LogOut size={15} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-black font-semibold hover:bg-yellow-400 transition-colors"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                <User size={15} />
                Login
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="sm:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors"
                aria-label="Login"
              >
                <User size={19} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors"
              data-testid="mobile-menu-button"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleMobileSubmit}>
              <div className="flex items-stretch rounded-lg overflow-hidden border border-white/10 bg-white/5">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-14 flex items-center justify-center bg-primary text-black hover:bg-yellow-400 transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3 bg-black/95">
            <Link to="/" className="block text-sm text-gray-300 hover:text-primary transition-colors py-1">
              Home
            </Link>

            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="block text-sm text-gray-400 hover:text-primary transition-colors py-1"
              >
                {cat}
              </Link>
            ))}

            <Link to="/products" className="block text-sm text-gray-300 hover:text-primary transition-colors py-1">
              All Products
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
