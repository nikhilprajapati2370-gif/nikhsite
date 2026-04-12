import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const CATEGORIES = ["Microcontrollers", "Sensors & Modules", "Robotics & Motors", "Development Boards", "Electronic Components", "3D Printing", "IoT & Wireless Modules"];
const SORT_OPTIONS = [
  { value: "", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPage(p);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Page header */}
        <div className="bg-card border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {category || (search ? `"${search}"` : "All Products")}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{total} products found</p>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 lg:hidden text-sm border border-white/10 px-4 py-2 rounded-md text-gray-400 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>

            {/* Active filters */}
            {(category || search) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {category && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full">
                    {category}
                    <button onClick={() => setFilter("category", "")} className="hover:text-primary/60"><X size={10} /></button>
                  </span>
                )}
                {search && (
                  <span className="flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full">
                    "{search}"
                    <button onClick={() => setFilter("search", "")} className="hover:text-primary/60"><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-destructive hover:text-red-400 underline">Clear all</button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block w-56 flex-shrink-0`}>
              <div className="bg-card border border-white/10 rounded-lg p-4 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Filters</h3>
                  <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-primary">Reset</button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Category</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setFilter("category", "")}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${!category ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                      data-testid="filter-all"
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilter("category", cat)}
                        className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${category === cat ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                        data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{total} results</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Sort:</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setFilter("sort", e.target.value)}
                      className="appearance-none bg-card border border-white/10 text-sm text-white px-4 py-2 pr-8 rounded-md focus:outline-none focus:border-primary/30 cursor-pointer"
                      data-testid="sort-select"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="rounded-lg shimmer h-64" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No products found</h3>
                  <p className="text-sm text-gray-500">Try adjusting your filters or search term</p>
                  <button onClick={clearFilters} className="mt-4 text-primary text-sm hover:underline">Clear filters</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="products-grid">
                    {products.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => fetchProducts(p)}
                          className={`w-9 h-9 text-sm rounded-md font-mono transition-colors ${p === page ? "bg-primary text-black font-bold" : "bg-card border border-white/10 text-gray-400 hover:border-primary/30 hover:text-primary"}`}
                          data-testid={`page-${p}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;
