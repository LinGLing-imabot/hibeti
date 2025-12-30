import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🧪 TEST ROUTE (KEEP THIS FOR NOW)
app.get("/test-gemini", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Say hello in one short sentence." }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🤍 BUNTY CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "You are Bunty’s Helper. Friendly, calm, helpful. Keep replies short.\n\nUser: " +
                    userMessage
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "🤍 Bunty: I’m not sure what to say.";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({
      reply: "⚠️ Bunty had trouble thinking."
    });
  }
});

// 🌐 FRONTEND
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ▶️ START SERVER
app.listen(PORT, () => {
  console.log(`Bunty’s Helper running on port ${PORT}`);
});
