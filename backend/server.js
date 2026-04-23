console.log("🔥 AUTH + AI SERVER RUNNING");
console.log("🔥 NEW DEPLOY VERSION 2");
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * 💬 CHAT API
 */
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.json({ reply: "Please type something." });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a pet care assistant.

Give clean, well-structured answers:
- No symbols like ** or ###
- Use simple headings and bullet points
- Keep it neat and readable

Example:

Feeding Your Dog

• Feed twice daily
• Use quality food
• Provide fresh water
          `,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawReply = completion.choices[0].message.content;

    const cleanReply = rawReply
      .replace(/#{1,6}\s*/g, "")        // remove # ## ###
      .replace(/\*\*(.+?)\*\*/g, "$1")  // remove **bold**
      .replace(/\*(.+?)\*/g, "$1")      // remove *italic*
      .replace(/\+\s*/g, "• ")          // convert + to bullet
      .replace(/\*\s*/g, "• ")          // convert * to bullet
      .replace(/\n{3,}/g, "\n\n")       // remove extra blank lines
      .trim();

    res.json({ reply: cleanReply });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ reply: "AI error occurred." });
  }
});

/**
 * 🔐 AUTH SYSTEM
 */
const usersFile = path.join(__dirname, "users.json");

// Create file if not exists
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, "[]");
}

// Signup
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ message: "All fields required" });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));

  if (users.find((u) => u.username === username)) {
    return res.json({ message: "User already exists" });
  }

  users.push({ username, password });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: "Signup successful" });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(usersFile));

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user });
});

/**
 * 🧪 TEST ROUTE
 */
app.get("/check", (req, res) => {
  res.send("CHECK WORKING ✅");
});

/**
/**
 * ✅ API ROUTES FIRST
 */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/api", (req, res) => {
  res.send("🚀 Backend API Running");
});


/**
 * 🌐 SERVE FRONTEND (FOR DEPLOYMENT)
 */
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


/**
 * 🚀 START SERVER
 */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});