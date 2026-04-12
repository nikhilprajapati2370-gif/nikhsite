import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, MapPin, Package, AlertTriangle, CheckCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY || "";

const loadRazorpay = () => new Promise((resolve) => {
  const existing = document.querySelector('script[src*="razorpay"]');
  if (existing) { resolve(true); return; }
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = totalPrice >= 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;

  const [form, setForm] = useState({
    name: user?.name || "", phone: "", address: "", city: "", state: "", pincode: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
    // Check if Razorpay key is configured
    api.post("/payment/create-order", { amount: 100 }).then(res => {
      setDemoMode(!!res.data.demo);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const createOrder = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const orderData = {
      items: items.map(item => ({
        product_id: item.id, name: item.name, price: item.price,
        quantity: item.quantity, image_url: item.image_url
      })),
      total_amount: grandTotal,
      shipping_address: form,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    };
    const res = await api.post("/orders", orderData);
    clearCart();
    navigate(`/order-success/${res.data.id}`);
  };

  const handleDemoPayment = async () => {
    setDemoStep(1);
    await new Promise(r => setTimeout(r, 1500));
    setDemoStep(2);
    const orderId = `order_demo_${Date.now()}`;
    const paymentId = `pay_demo_${Date.now()}`;
    await createOrder(orderId, paymentId, "demo_signature");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [k, v] of Object.entries(form)) {
      if (!v.trim()) { setError(`Please fill in ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}`); return; }
    }
    if (!/^\d{10}$/.test(form.phone)) { setError("Enter a valid 10-digit phone number"); return; }
    if (!/^\d{6}$/.test(form.pincode)) { setError("Enter a valid 6-digit pincode"); return; }
    setError("");
    setLoading(true);

    try {
      const orderRes = await api.post("/payment/create-order", {
        amount: Math.round(grandTotal * 100),
        receipt: `order_${Date.now()}`
      });

      if (orderRes.data.demo) {
        setLoading(false);
        await handleDemoPayment();
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { setError("Failed to load payment gateway. Please try again."); setLoading(false); return; }

      const options = {
        key: RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Buildoreo",
        description: `Order of ${items.length} item(s)`,
        order_id: orderRes.data.id,
        prefill: { name: form.name, contact: form.phone },
        theme: { color: "#FACC15" },
        handler: async (response) => {
          try {
            await createOrder(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
          } catch (err) {
            setError("Order creation failed. Please contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setError(err.response?.data?.detail || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  if (demoStep > 0) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        {demoStep === 1 ? (
          <>
            <div className="w-16 h-16 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }} />
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Processing Payment...</h3>
            <p className="text-sm text-gray-500">Demo mode - simulating payment</p>
          </>
        ) : (
          <>
            <CheckCircle size={48} className="text-accent mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Payment Successful!</h3>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Checkout</h1>

        {/* Demo mode banner */}
        {demoMode && (
          <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Demo Mode Active</p>
              <p className="text-xs text-gray-400 mt-0.5">Razorpay is not configured. Payment will be simulated for testing.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <AlertTriangle size={14} className="text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-white/10 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-primary" />
                  <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "name", label: "Full Name", placeholder: "John Doe", full: true },
                    { name: "phone", label: "Phone Number", placeholder: "9876543210" },
                    { name: "pincode", label: "Pincode", placeholder: "560001" },
                    { name: "city", label: "City", placeholder: "Bangalore" },
                    { name: "state", label: "State", placeholder: "Karnataka" },
                    { name: "address", label: "Full Address", placeholder: "Street, Area, Landmark", full: true },
                  ].map(field => (
                    <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                      {field.name === "address" ? (
                        <textarea
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          rows={2}
                          className="w-full bg-input border border-white/10 text-white text-sm px-3 py-2.5 rounded-md focus:outline-none focus:border-primary/50 resize-none placeholder-gray-600"
                          data-testid={`checkout-${field.name}`}
                        />
                      ) : (
                        <input
                          type={field.name === "phone" || field.name === "pincode" ? "tel" : "text"}
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="w-full bg-input border border-white/10 text-white text-sm px-3 py-2.5 rounded-md focus:outline-none focus:border-primary/50 placeholder-gray-600"
                          data-testid={`checkout-${field.name}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-white/10 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={16} className="text-primary" />
                  <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Payment</h2>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-md border border-white/10">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-sm text-gray-300">
                    {demoMode ? "Demo Payment (test mode)" : "Razorpay - UPI, Cards, Wallets, NetBanking"}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-white/10 rounded-lg p-5 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={16} className="text-primary" />
                  <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Order Summary</h2>
                </div>

                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-2 text-xs">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover bg-black/40 flex-shrink-0"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=50&q=40"; }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 line-clamp-1">{item.name}</p>
                        <p className="text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="text-primary font-mono">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-mono">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className={`font-mono ${shipping === 0 ? "text-accent" : ""}`}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="price-tag text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full btn-primary py-3 rounded-md text-sm font-bold mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="place-order-button"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={16} />
                      {demoMode ? "Place Demo Order" : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
