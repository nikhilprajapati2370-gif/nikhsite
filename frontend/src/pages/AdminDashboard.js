import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package, ShoppingBag, Users, DollarSign,
  Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  X, Save, AlertCircle, Cpu, BarChart3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_COLORS = {
  paid: "bg-green-500/15 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  delivered: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

const CATEGORIES = ["Microcontrollers", "Sensors & Modules", "Robotics & Motors", "Development Boards", "Electronic Components", "3D Printing", "IoT & Wireless Modules"];

const EMPTY_PRODUCT = { name: "", description: "", price: "", category: CATEGORIES[0], stock: "", image_url: "", brand: "", featured: false };

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [productTotal, setProductTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchStats = useCallback(async () => {
    try { const r = await api.get("/admin/stats"); setStats(r.data); } catch {}
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/products?page=${page}&limit=10`);
      setProducts(r.data.products || []);
      setProductTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const r = await api.get(`/admin/orders?page=${page}&limit=10`);
      setOrders(r.data.orders || []);
      setOrderTotal(r.data.total || 0);
    } catch {} finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const r = await api.get("/admin/users?limit=50");
      setUsers(r.data.users || []);
      setUserTotal(r.data.total || 0);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === "products") fetchProducts(productPage); }, [tab, productPage]);
  useEffect(() => { if (tab === "orders") fetchOrders(orderPage); }, [tab, orderPage]);
  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab]);

  const openAddModal = () => {
    setEditProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name, description: product.description, price: product.price,
      category: product.category, stock: product.stock, image_url: product.image_url,
      brand: product.brand, featured: product.featured || false
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSaveProduct = async () => {
    const { name, price, stock, brand, category } = productForm;
    if (!name || !price || !stock || !brand || !category) { setFormError("All required fields must be filled"); return; }
    if (isNaN(price) || price <= 0) { setFormError("Price must be a positive number"); return; }
    setSaving(true);
    try {
      const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) };
      if (editProduct) { await api.put(`/admin/products/${editProduct.id}`, data); }
      else { await api.post("/admin/products", data); }
      setModalOpen(false);
      fetchProducts(productPage);
      fetchStats();
    } catch (err) { setFormError(err.response?.data?.detail || "Failed to save product"); }
    finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id) => {
    try { await api.delete(`/admin/products/${id}`); fetchProducts(productPage); fetchStats(); setConfirmDelete(null); } catch {}
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try { await api.put(`/admin/orders/${orderId}/status`, { status }); fetchOrders(orderPage); } catch {}
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
                <Cpu size={14} className="text-black" />
              </div>
              <span className="font-extrabold text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Build<span className="text-primary">oreo</span>
              </span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-destructive transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-card border border-white/10 rounded-lg p-1 w-fit mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all ${
                tab === t.id ? "bg-primary text-black" : "text-gray-400 hover:text-white"
              }`}
              data-testid={`admin-tab-${t.id}`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Products", value: stats?.total_products, icon: Package, color: "text-blue-400" },
                { label: "Total Orders", value: stats?.total_orders, icon: ShoppingBag, color: "text-green-400" },
                { label: "Total Revenue", value: stats?.total_revenue ? `₹${Math.round(stats.total_revenue).toLocaleString('en-IN')}` : "₹0", icon: DollarSign, color: "text-primary" },
                { label: "Total Users", value: stats?.total_users, icon: Users, color: "text-purple-400" },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`} style={{ fontFamily: 'JetBrains Mono, monospace' }} data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                    {stat.value ?? "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            {stats?.recent_orders?.length > 0 && (
              <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Orders</h3>
                  <button onClick={() => setTab("orders")} className="text-xs text-primary hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500">
                        <th className="text-left px-4 py-2.5">Customer</th>
                        <th className="text-left px-4 py-2.5">Amount</th>
                        <th className="text-left px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recent_orders.map(order => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/2">
                          <td className="px-4 py-2.5 text-gray-300">{order.user_name || order.user_email}</td>
                          <td className="px-4 py-2.5 font-mono text-primary">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">{productTotal} products total</p>
              <button
                onClick={openAddModal}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold"
                data-testid="add-product-button"
              >
                <Plus size={13} /> Add Product
              </button>
            </div>
            <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500">
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-left px-4 py-3">Price</th>
                      <th className="text-left px-4 py-3">Stock</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-6 shimmer rounded" /></td></tr>
                      ))
                    ) : products.map(product => (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={product.image_url} alt={product.name}
                              className="w-8 h-8 rounded object-cover bg-black/40 flex-shrink-0"
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=40&q=40"; }} />
                            <div>
                              <p className="text-gray-200 font-semibold line-clamp-1 max-w-[200px]">{product.name}</p>
                              <p className="text-gray-600">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{product.category}</td>
                        <td className="px-4 py-3 font-mono text-primary">₹{product.price?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`font-mono ${product.stock < 10 ? "text-destructive" : product.stock < 30 ? "text-yellow-400" : "text-gray-300"}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(product)} className="p-1.5 text-gray-500 hover:text-primary transition-colors" data-testid={`edit-product-${product.id}`}>
                              <Edit size={13} />
                            </button>
                            <Link to={`/products/${product.id}`} className="p-1.5 text-gray-500 hover:text-accent transition-colors">
                              <Eye size={13} />
                            </Link>
                            <button onClick={() => setConfirmDelete(product.id)} className="p-1.5 text-gray-500 hover:text-destructive transition-colors" data-testid={`delete-product-${product.id}`}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {productTotal > 10 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                  <span className="text-xs text-gray-500">Page {productPage} of {Math.ceil(productTotal / 10)}</span>
                  <div className="flex gap-2">
                    <button disabled={productPage === 1} onClick={() => setProductPage(p => p - 1)} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 rounded">
                      <ChevronLeft size={12} />
                    </button>
                    <button disabled={productPage >= Math.ceil(productTotal / 10)} onClick={() => setProductPage(p => p + 1)} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 rounded">
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-gray-400 mb-4">{orderTotal} orders total</p>
            <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500">
                      <th className="text-left px-4 py-3">Order ID</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-left px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-6 shimmer rounded" /></td></tr>
                    )) : orders.map(order => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3 font-mono text-gray-500">{order.id?.slice(-8)}</td>
                        <td className="px-4 py-3 text-gray-300">{order.user_name || order.user_email}</td>
                        <td className="px-4 py-3 font-mono text-primary">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-xs rounded-full px-2 py-0.5 border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}
                            data-testid={`order-status-${order.id}`}
                          >
                            {["pending", "paid", "processing", "shipped", "delivered", "cancelled"].map(s => (
                              <option key={s} value={s} className="bg-card text-white">{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orderTotal > 10 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                  <span className="text-xs text-gray-500">Page {orderPage} of {Math.ceil(orderTotal / 10)}</span>
                  <div className="flex gap-2">
                    <button disabled={orderPage === 1} onClick={() => setOrderPage(p => p - 1)} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 rounded"><ChevronLeft size={12} /></button>
                    <button disabled={orderPage >= Math.ceil(orderTotal / 10)} onClick={() => setOrderPage(p => p + 1)} className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 border border-white/10 rounded"><ChevronRight size={12} /></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-gray-400 mb-4">{userTotal} users total</p>
            <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500">
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Role</th>
                      <th className="text-left px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-bold">{(u.name || "?")[0].toUpperCase()}</span>
                            </div>
                            <span className="text-gray-300">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${u.role === "admin" ? "bg-primary/15 text-primary border-primary/30" : "bg-white/5 text-gray-400 border-white/10"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {editProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {formError && (
                <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/30 rounded-md">
                  <AlertCircle size={12} className="text-destructive flex-shrink-0" />
                  <p className="text-xs text-destructive">{formError}</p>
                </div>
              )}
              {[
                { key: "name", label: "Product Name *", placeholder: "Arduino Uno R3" },
                { key: "brand", label: "Brand *", placeholder: "Arduino" },
                { key: "image_url", label: "Image URL", placeholder: "https://..." },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    value={productForm[f.key]}
                    onChange={(e) => setProductForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-input border border-white/10 text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-primary/30"
                    data-testid={`product-form-${f.key}`}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price (₹) *</label>
                  <input
                    type="number" value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="599"
                    className="w-full bg-input border border-white/10 text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-primary/30"
                    data-testid="product-form-price"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Stock *</label>
                  <input
                    type="number" value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="100"
                    className="w-full bg-input border border-white/10 text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-primary/30"
                    data-testid="product-form-stock"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-input border border-white/10 text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-primary/30"
                  data-testid="product-form-category"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                  rows={3}
                  className="w-full bg-input border border-white/10 text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-primary/30 resize-none"
                  data-testid="product-form-description"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded accent-primary"
                  data-testid="product-form-featured"
                />
                <span className="text-xs text-gray-400">Mark as featured</span>
              </label>
            </div>
            <div className="flex gap-2 p-4 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2 text-xs border border-white/10 text-gray-400 rounded-md hover:border-primary/30 hover:text-primary">
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={saving}
                className="flex-1 btn-primary py-2 text-xs rounded-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                data-testid="save-product-button"
              >
                {saving ? <span className="w-3 h-3 border border-black border-t-transparent rounded-full animate-spin" /> : <><Save size={12} /> Save</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-sm font-bold text-white mb-2">Confirm Delete</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 text-xs border border-white/10 text-gray-400 rounded-md">Cancel</button>
              <button onClick={() => handleDeleteProduct(confirmDelete)} className="flex-1 py-2 text-xs bg-destructive text-white rounded-md hover:bg-red-600" data-testid="confirm-delete-button">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
