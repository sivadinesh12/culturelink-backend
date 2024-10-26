const express = require("express");
const app = express();
const cors = require("cors");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "products.db");

let db;

const initializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(10000, () => {
      console.log("Server running on port 10000");
    });
    await db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            quality TEXT NOT NULL
            )`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDatabase();

app.post("/add-pproducts", async (req, res) => {
  const { name, price, quality } = req.body;
  if (!name || !price || !quality) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await db.run(
      `
        INSERT INTO products (name,price,quality)
        VALUES (?,?,?)
        `,
      [name, price, quality]
    );
    res.json({ message: "Product added successfully" });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    res.status(500).json({ message: "Error adding product" });
  }
});

app.get("/products", async (req, res) => {
  try {
    await db.get(`SELECT * FROM products`);
    res.status(200).json({ message: "Product fetched successfully" });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    res.status(500).json({ message: "Error fetching products" });
  }
});
