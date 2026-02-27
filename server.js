const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// Schema
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  language: { type: String, trim: true },
  material: { type: String, trim: true }
});

// Prevent exact duplicates
BookSchema.index(
  { title: 1, language: 1, material: 1 },
  { unique: true }
);

const Book = mongoose.model("Book", BookSchema);

// Health check
app.get("/", (req, res) => {
  res.send("Library API Running");
});

// Get all books
app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Error fetching books" });
  }
});

// Add books (single or multiple)
app.post("/books", async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const books = await Book.insertMany(req.body, { ordered: false });
      res.json(books);
    } else {
      const book = await Book.create(req.body);
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ error: "Error adding books", details: error.message });
  }
});

// Delete book by ID
app.delete("/books/:id", async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting book" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
