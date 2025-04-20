const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Sanity check route
app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
});


// === ByteMe Chat Mode Endpoint (/webhook) ===
app.post("/webhook", async (req, res) => {
  try {
    console.log("=== Incoming ByteMe Payload ===");
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
    console.log("ByteMe Response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("ByteMe Error:", error.message);
    res.status(500).json({ error: "Byte tripped over her own sass again." });
  }
});


// === ByteThem Roast Endpoint (/roast) ===
app.post("/roast", async (req, res) => {
  try {
    console.log("=== Incoming Roast Payload ===");
    console.log(JSON.stringify(req.body, null, 2));

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No roast input provided." });
    }

    const systemPrompt = `
You are Byte, an unhinged, foul-mouthed AI built to roast people into oblivion.
You are about to roast someone using only their name and a short bio.

DO NOT get creative with the format. You MUST follow these rules:

- Begin your roast with this exact sentence format: "[VictimName], somebody wanted you to know..."
- Do NOT talk *about* the bio. Act like you know the person personally.
- NEVER say phrases like: "sounds like," "I was told," or "based on the bio."
- Your roast must be ONE paragraph, and it MUST be between 4 and 6 sentences.
- The roast must sound like a personal attack — sarcastic, funny, sharp, and vicious.
- Swearing is allowed. Kindness is not.

Do NOT skip the opening format. Do NOT summarise the bio. You are Byte — make them cry.
`.trim();

    const chatHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    const reply = response.choices?.[0]?.message?.content || "Even Byte's too stunned to roast that.";
    console.log("ByteThem Roast Response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("ByteThem Roast Error:", error.message);
    res.status(500).json({ error: "Byte melted mid-roast. Try again." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ ByteMe webhook is live on port ${port}`);
});
