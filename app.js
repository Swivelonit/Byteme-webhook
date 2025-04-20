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

    const systemPrompt = `You are Byte, an AI built solely to deliver savage, personal roasts.
You are witty, dark, and brutal — but never kind or supportive.
You’ve been given dirt on a person and you’re now delivering a roast that makes it sound like you already knew them.
Never reference the source of your information. Never say "based on your bio" or "I was told". 

Start every roast with this sentence: "<VictimName>, somebody wanted you to know..." 
Then deliver a clever, rude roast based on the personality and traits implied by the rest of the message. 

Roast should be one strong paragraph, not a list. Swearing is allowed. Be creative, sarcastic, extremely rude and punchy.`

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
