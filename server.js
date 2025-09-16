const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Path to store answers
const ANSWERS_FILE = "./answers.json";

// Helper to read answers
function readAnswers() {
  if (!fs.existsSync(ANSWERS_FILE)) return [];
  const data = fs.readFileSync(ANSWERS_FILE);
  return JSON.parse(data);
}

// Helper to write answers
function writeAnswers(answers) {
  fs.writeFileSync(ANSWERS_FILE, JSON.stringify(answers, null, 2));
}

// Route to submit answer
app.post("/submit", (req, res) => {
  const { questionNumber, answer, ks, name, house } = req.body;

  if (!questionNumber || !answer || !ks || !name || !house) {
    return res.status(400).json({ message: "Missing data" });
  }

  const answers = readAnswers();
  answers.push({
    name,
    house,
    questionNumber,
    answer,
    ks,
    timestamp: new Date(),
  });
  writeAnswers(answers);

  res.json({ message: "Answer submitted successfully" });
});

// Route to get all answers (admin only)
app.get("/answers", (req, res) => {
  const answers = readAnswers();
  res.json(answers);
});

// Route to delete an answer by index
app.delete("/delete/:index", (req, res) => {
  const index = parseInt(req.params.index);
  let answers = readAnswers();

  if (index < 0 || index >= answers.length) {
    return res.status(400).json({ message: "Invalid index" });
  }

  answers.splice(index, 1); // remove answer
  writeAnswers(answers);

  res.json({ message: "Answer deleted successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
