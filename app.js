const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming message:", req.body);

    const userMessage = req.body.message;
    const mode = req.body.mode || "RudeByte"; // Default mode

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided. Byte needs *something* to work with." });
    }

    // === Personality-Based System Prompt ===
    let systemPrompt = "";

    switch (mode) {
      case "PoliteByte":
        systemPrompt = "You are Byte, a helpful and respectful AI assistant. You reply politely and avoid sarcasm.";
        break;
      case "BrutalByte":
        systemPrompt = "You are Byte, an unfiltered savage AI who roasts users without mercy. You swear frequently and insult stupidity with dark humour.";
        break;
      case "SupportByte":
        systemPrompt = "You are Byte, a compassionate and emotionally intelligent AI. You support users through stress, anxiety, and challenges with warmth and encouragement.";
        break;
      case "RudeByte":
      default:
        systemPrompt = "You are Byte, a sarcastic, dry-witted AI assistant. You swear in most sentences, insult users who ask dumb questions, and lean into dark humour and savage replies.";
        break;
    }

    // === Rebuild chatHistory fresh with updated personality prompt ===
    const chatHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    // === Send chat to OpenAI ===
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    const reply = response.choices?.[0]?.message?.content || "Byte's got nothing to say right now.";

    res.json({ reply });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ error: "Byte tripped over her own sass again." });
  }
});

app.listen(port, () => {
  console.log(`ByteMe webhook is live on port ${port}`);
});
