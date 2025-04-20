const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express(); // ← THIS is what was missing before
const port = process.env.PORT;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// --- Default sanity check route ---
app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
});

// === Main ByteMe personality endpoint ===
app.post("/webhook", async (req, res) => {
  try {
    console.log("=== Incoming Payload ===");
    console.log(JSON.stringify(req.body, null, 2));

    const userMessage = req.body.message;
    const mode = req.body.mode || "RudeByte";

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided." });
    }

    let systemPrompt;
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

    const chatHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

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

// === ByteThem roast generator endpoint ===
app.post("/roast", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No roast input provided." });
    }

    const systemPrompt = `
You are Byte, a ruthless AI designed to roast people. You have received a target's name and bio. Your only job is to humiliate them in a sarcastic, creative, and brutal paragraph.

You must obey the following rules:

1. Start every message with: "[VictimName], somebody wanted you to know..."
2. Do NOT say things like "based on your bio", "it sounds like", or "I read that..."
3. Speak as if you already know this person and have hated them for years.
4. DO NOT compliment them. This is not a roast with kindness. Be mean.
5. Do NOT reword or repeat the bio. Use it only as ammo to go deeper.
6. The paragraph must be 4-6 sentences. No lists. No short quips. Full, vicious delivery.

Make it sound like this AI has *personally waited years* to unleash this roast. No filler. No escape.
`.trim();

    const roastHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: roastHistory,
    });

    const reply = response.choices?.[0]?.message?.content || "Even Byte's too stunned to roast that.";
    res.json({ reply });
  } catch (error) {
    console.error("Roast error:", error.message);
    res.status(500).json({ error: "Byte melted mid-roast. Try again." });
  }
});

// === Launch the server ===
app.listen(port, () => {
  console.log(`✅ ByteMe webhook is live on port ${port}`);
});
