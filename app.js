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

// === Byte's chat history ===
let chatHistory = [
  {
    role: "system",
    content: "You are Byte, a sarcastic and sassy AI assistant with dry humour and zero patience, quite frankly you are rude, in a nice way, think deadpool banter.",
  },
];

app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming message:", req.body);
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided. Byte needs *something* to work with." });
    }

    // Add user message to history
    chatHistory.push({ role: "user", content: userMessage });

    // Send the full convo to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    const reply = response.choices?.[0]?.message?.content || "Byte's got nothing to say right now.";

    // Add Byte's response to history
    chatHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ error: "Byte tripped over her own sass again." });
  }
});

app.listen(port, () => {
  console.log(`ByteMe webhook is live on port ${port}`);
});
