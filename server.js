const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// JSONBin Setup
const BIN_URL = "https://api.jsonbin.io/v3/b/690b17b443b1c97be99a151a";
const API_KEY = "$2a$10$8pepyAuO22OWzCu2zyFNp./KrHVUnYFw.QptMKs/gHJjP6veGHxVa";

// Read answers
async function readAnswers() {
  const res = await fetch(BIN_URL, {
    method: "GET",
    headers: { "X-Master-Key": API_KEY }
  });
  const data = await res.json();
  return data.record.answers;
}

// Write answers
async function writeAnswers(answers) {
  await fetch(BIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify({ answers })
  });
}

// Submit Answer
app.post("/submit", async (req, res) => {
  const { questionNumber, answer, ks, name, house } = req.body;

  if (!questionNumber || !answer || !ks || !name || !house) {
    return res.status(400).json({ message: "Missing data" });
  }

  const answers = await readAnswers();
  answers.push({
    name,
    house,
    questionNumber,
    answer,
    ks,
    timestamp: new Date()
  });

  await writeAnswers(answers);
  res.json({ message: "Answer submitted successfully" });
});

// Get all answers (admin)
app.get("/answers", async (req, res) => {
  const answers = await readAnswers();
  res.json(answers);
});

// Delete answer by index
app.delete("/delete/:index", async (req, res) => {
  const index = parseInt(req.params.index);
  const answers = await readAnswers();

  if (index < 0 || index >= answers.length) {
    return res.status(400).json({ message: "Invalid index" });
  }

  answers.splice(index, 1);
  await writeAnswers(answers);

  res.json({ message: "Answer deleted successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
