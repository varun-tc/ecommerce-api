// In-memory store — replace with a real DB (Postgres, MongoDB, etc.)
const users = [];
const products = [
  { id: "1", name: "Wireless Headphones", price: 79.99, stock: 50, category: "Electronics" },
  { id: "2", name: "Running Shoes", price: 120.0, stock: 30, category: "Footwear" },
  { id: "3", name: "Coffee Mug", price: 14.99, stock: 100, category: "Kitchen" },
];
const orders = [];

module.exports = { users, products, orders };
