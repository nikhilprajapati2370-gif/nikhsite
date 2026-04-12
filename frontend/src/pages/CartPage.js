import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  if (items.length === 0) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-card border border-white/10 flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">Add some products to get started!</p>
        <Link to="/products" className="btn-primary flex items-center gap-2 px-8 py-3 rounded-md text-sm font-bold">
          Start Shopping <ArrowRight size={14} />
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your Cart <span className="text-primary">({items.length})</span>
          </h1>
          <button onClick={clearCart} className="text-xs text-destructive hover:text-red-400 underline" data-testid="clear-cart">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-card border border-white/10 rounded-lg p-4 hover:border-primary/20 transition-colors"
                data-testid={`cart-item-${item.id}`}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md bg-black/40"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=60"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{item.brand}</p>
                  <Link to={`/products/${item.id}`} className="text-sm font-semibold text-white hover:text-primary transition-colors line-clamp-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {item.name}
                  </Link>
                  <p className="price-tag text-base mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-600 hover:text-destructive transition-colors"
                    data-testid={`remove-item-${item.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center border border-white/10 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 py-1 text-white font-mono text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Total: <span className="text-primary font-mono">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-white/10 rounded-lg p-5 sticky top-20">
              <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-mono text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={`font-mono ${shipping === 0 ? "text-accent" : "text-white"}`}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-accent">You qualify for free shipping!</p>
                )}
                {shipping > 0 && (
                  <p className="text-xs text-gray-600">Add ₹{(999 - totalPrice).toLocaleString('en-IN')} more for free shipping</p>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
                  <span className="text-white">Grand Total</span>
                  <span className="price-tag text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={() => user ? navigate("/checkout") : navigate("/login", { state: { from: "/checkout" } })}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold mt-5"
                data-testid="checkout-button"
              >
                <ShoppingCart size={16} />
                {user ? "Proceed to Checkout" : "Login to Checkout"}
              </button>
              <Link to="/products" className="block text-center text-xs text-gray-500 hover:text-primary mt-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
