const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { products } = require("../db");
const { authenticate } = require("../middleware/auth");

// GET /api/products — public
router.get("/", (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let result = products;
  if (category) result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (minPrice) result = result.filter((p) => p.price >= parseFloat(minPrice));
  if (maxPrice) result = result.filter((p) => p.price <= parseFloat(maxPrice));
  res.json(result);
});

// GET /api/products/:id — public
router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// POST /api/products — protected
router.post("/", authenticate, (req, res) => {
  const { name, price, stock, category } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: "name and price are required" });
  }
  const product = { id: uuidv4(), name, price: parseFloat(price), stock: stock ?? 0, category: category || "General" };
  products.push(product);
  res.status(201).json(product);
});

// PUT /api/products/:id — protected
router.put("/:id", authenticate, (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  const { name, price, stock, category } = req.body;
  if (name != null) products[idx].name = name;
  if (price != null) products[idx].price = parseFloat(price);
  if (stock != null) products[idx].stock = stock;
  if (category != null) products[idx].category = category;
  res.json(products[idx]);
});

// DELETE /api/products/:id — protected
router.delete("/:id", authenticate, (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  products.splice(idx, 1);
  res.json({ message: "Product deleted" });
});

module.exports = router;
