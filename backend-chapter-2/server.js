const express = require("express");

const app = express();
const PORT = 3000;

console.log("Server is starting...");

// MIDDLEWARE
app.use(express.json());

// START THE SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// WEBSITE
app.get("/home", (req, res) => {
  res.send("Hello, World!");
});

// API
app.get("/api/data", (req, res) => {
  res.json({ message: "This is some data from the server." });
});

app.post("/api/data", (req, res) => {
  console.log(req.body);
  res.sendStatus(201);
});
