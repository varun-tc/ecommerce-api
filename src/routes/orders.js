const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { orders, products } = require("../db");
const { authenticate } = require("../middleware/auth");

// GET /api/orders — returns only the current user's orders
router.get("/", authenticate, (req, res) => {
  const userOrders = orders.filter((o) => o.userId === req.user.id);
  res.json(userOrders);
});

// GET /api/orders/:id
router.get("/:id", authenticate, (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  res.json(order);
});

// POST /api/orders
// body: { items: [{ productId, quantity }] }
router.post("/", authenticate, (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array is required" });
  }

  const lineItems = [];
  for (const { productId, quantity } of items) {
    const product = products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: `Product ${productId} not found` });
    if (product.stock < quantity) {
      return res.status(409).json({ error: `Insufficient stock for ${product.name}` });
    }
    lineItems.push({ productId, name: product.name, price: product.price, quantity });
  }

  // Deduct stock
  for (const { productId, quantity } of lineItems) {
    const product = products.find((p) => p.id === productId);
    product.stock -= quantity;
  }

  const total = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = {
    id: uuidv4(),
    userId: req.user.id,
    items: lineItems,
    total: parseFloat(total.toFixed(2)),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

// PATCH /api/orders/:id/status — update order status
router.patch("/:id/status", authenticate, (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  const { status } = req.body;
  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
  }
  order.status = status;
  res.json(order);
});

module.exports = router;
