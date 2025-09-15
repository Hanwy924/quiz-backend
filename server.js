const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const RESULTS_FILE = "results.json";

// Load existing results
function loadResults() {
  if (!fs.existsSync(RESULTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(RESULTS_FILE));
}

// Save results
function saveResults(results) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
}

// ✅ Submit answers
app.post("/submit", (req, res) => {
  const { ks, house, answers } = req.body;
  if (!ks || !house || !answers) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const score = answers.filter(a => typeof a === "number").length;
  const newResult = {
    ks,
    house,
    answers,
    score,
    time: new Date().toLocaleString()
  };

  const results = loadResults();
  results.push(newResult);
  saveResults(results);

  res.json({ success: true });
});

// ✅ Get results (for admin)
app.get("/results", (req, res) => {
  const results = loadResults();
  res.json(results);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
