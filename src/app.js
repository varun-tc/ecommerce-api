const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));

app.get("/", (req, res) => res.json({ message: "Ecommerce API is running" }));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

module.exports = app;
