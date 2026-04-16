console.log("🔥 AUTH VERSION RUNNING");

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const data = require("./data.json");

const app = express();

/**
 * ✅ CORS FIX (FOR DEPLOYMENT)
 */
app.use(cors()); // allow all (important for Railway)

app.use(express.json());

/**
 * 🤖 Chatbot Logic
 */
function getResponse(message) {
  if (!message) return "Please enter a message 😊";

  message = message.toLowerCase();
  const words = message.split(" ");

  const synonyms = {
    eat: "food",
    eating: "food",
    meal: "food",
    diet: "food",
    feed: "food",
    feeding: "food",
    sick: "health",
    ill: "health",
    vomiting: "health",
    noteating: "health",
    bath: "clean",
    wash: "clean",
    injection: "vaccine",
    shot: "vaccine"
  };

  let normalizedWords = words.map((w) => synonyms[w] || w);

  let bestMatch = null;
  let maxScore = 0;

  data.intents.forEach((intent) => {
    let score = 0;

    intent.keywords.forEach((keyword) => {
      if (normalizedWords.includes(keyword)) score += 2;
      else if (message.includes(keyword)) score += 1;
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = intent;
    }
  });

  if (bestMatch && maxScore > 0) {
    const responses = bestMatch.responses;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  return "Hmm 🤔 I didn't understand. Ask about food, health, or care 🐾";
}

/**
 * 💬 CHAT API
 */
app.post("/chat", (req, res) => {
  try {
    const userMessage = req.body.message;

    console.log("📩 User:", userMessage);

    if (!userMessage) {
      return res.json({ reply: "Message is required!" });
    }

    const botReply = getResponse(userMessage);

    console.log("🤖 Bot:", botReply);

    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ Chat Error:", error);
    res.status(500).json({ reply: "Server error ❌" });
  }
});

/**
 * 🔐 AUTH
 */
const usersFile = path.join(__dirname, "users.json");

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.json({ message: "All fields required" });

  const users = JSON.parse(fs.readFileSync(usersFile));

  if (users.find((u) => u.username === username)) {
    return res.json({ message: "User already exists" });
  }

  users.push({ username, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: "Signup successful" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile));

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) return res.json({ message: "Invalid credentials" });

  res.json({ message: "Login successful", user });
});

/**
 * 🧪 TEST
 */
app.get("/check", (req, res) => {
  res.send("CHECK WORKING ✅");
});

/**
 * 🌐 SERVE FRONTEND (IMPORTANT FOR DEPLOY)
 */
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/**
 * 🚀 START
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});