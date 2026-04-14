import React, { useEffect, useState } from "react";
import api from "../services/api";

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // get user info
    api.get("/auth/me").then(res => setUser(res.data));

    // get orders
    api.get("/orders/me").then(res => setOrders(res.data.orders));
  }, []);

  return (
    <div>
      <h1>My Account</h1>

      {/* Profile */}
      <h2>Profile</h2>
      {user && (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}

      {/* Orders */}
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order.id}>
          <p>Order ID: {order.id}</p>
          <p>Total: ₹{order.total_amount}</p>
        </div>
      ))}
    </div>
  );
};

export default AccountPage;