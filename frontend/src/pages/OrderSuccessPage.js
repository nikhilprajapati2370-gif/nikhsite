import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, Home, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then(res => setOrder(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-accent" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Order Placed!
          </h1>
          <p className="text-sm text-gray-400">
            Thank you for shopping with Buildoreo. Your order has been received.
          </p>
          <div className="mt-3 px-4 py-2 bg-card border border-white/10 rounded-full inline-block">
            <span className="text-xs text-gray-500">Order ID: </span>
            <span className="text-xs font-mono text-primary">{orderId}</span>
          </div>
        </motion.div>

        {!loading && order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-white/10 rounded-lg overflow-hidden mb-6"
          >
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-primary" />
                <h2 className="font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Order Details</h2>
                <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                  order.status === "paid" ? "bg-green-500/15 text-green-400 border border-green-500/30" :
                  order.status === "delivered" ? "bg-accent/15 text-accent border border-accent/30" :
                  "bg-primary/15 text-primary border border-primary/30"
                }`}>
                  {order.status?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {(order.items || []).map(item => (
                <div key={item.product_id} className="flex gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded object-cover bg-black/40 flex-shrink-0"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=60&q=40"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-sm font-mono text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-sm text-gray-400">Total Amount</span>
              <span className="price-tag text-xl">₹{order.total_amount?.toLocaleString('en-IN')}</span>
            </div>

            {order.shipping_address && (
              <div className="px-5 pb-5">
                <p className="text-xs text-gray-500 mb-1">Shipping to:</p>
                <p className="text-sm text-gray-300">
                  {order.shipping_address.name}, {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                </p>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="flex-1 flex items-center justify-center gap-2 border border-white/10 text-white py-3 rounded-md text-sm font-semibold hover:border-primary/30 hover:text-primary transition-colors">
            <Home size={16} /> Back to Home
          </Link>
          <Link to="/products" className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold" data-testid="continue-shopping">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
