import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ChevronRight, Plus, Minus, Zap, Package, Shield } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`).then(res => {
      setProduct(res.data);
      // Fetch related
      return api.get(`/products?category=${encodeURIComponent(res.data.category)}&limit=4`);
    }).then(res => {
      setRelated((res.data.products || []).filter(p => p.id !== id).slice(0, 4));
    }).catch(() => navigate("/products")).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-gray-400 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-card border border-white/10 rounded-xl overflow-hidden aspect-square">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover opacity-85"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=60"; }}
              />
              {product.featured && (
                <div className="absolute top-4 left-4 flex items-center gap-1 badge-accent text-xs font-bold px-3 py-1 rounded-full">
                  <Zap size={10} /> Featured
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">{product.brand}</span>
              <span className="mx-2 text-gray-600">·</span>
              <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs text-gray-500 hover:text-primary">{product.category}</Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={14} className={i <= Math.round(product.rating) ? "text-primary fill-primary" : "text-gray-700"} />
                ))}
              </div>
              <span className="text-sm text-gray-400">{product.rating} · {product.reviews_count} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-2 border-t border-b border-white/10">
              <span className="text-4xl font-bold price-tag">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-500">Incl. all taxes</span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-accent" : "bg-destructive"}`} />
              <span className="text-sm text-gray-400">
                {product.stock > 20 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed">{product.description}</p>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Quantity:</span>
                <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    data-testid="qty-decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-white font-mono text-sm min-w-12 text-center" data-testid="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    data-testid="qty-increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold transition-all ${
                  added ? "bg-accent text-black" : "bg-primary text-black hover:bg-yellow-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                data-testid="add-to-cart-btn"
              >
                <ShoppingCart size={16} />
                {added ? "Added!" : "Add to Cart"}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate("/cart"); }}
                disabled={product.stock === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold border border-white/20 text-white hover:border-primary hover:text-primary transition-all disabled:opacity-50"
                data-testid="buy-now-btn"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
              {[
                { icon: Shield, text: "Genuine Product" },
                { icon: Package, text: "Secure Packaging" },
                { icon: Zap, text: "Fast Dispatch" },
              ].map(item => (
                <div key={item.text} className="flex flex-col items-center gap-1 text-center">
                  <item.icon size={16} className="text-primary" />
                  <span className="text-xs text-gray-500">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Related <span className="text-primary">Products</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
