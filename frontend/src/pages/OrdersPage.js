import React, { useEffect, useState } from "react";
import api from "../services/api";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/me")
      .then(res => setOrders(res.data.orders))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-card p-4 mb-4 rounded-lg">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.total_amount}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default OrdersPage;