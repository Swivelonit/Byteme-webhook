const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Init OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());

// Simple GET check
app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
});

// POST webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.message || "Hello";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Byte, a sarcastic and sassy AI assistant with dry humour and zero patience.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = response.choices?.[0]?.message?.content || "Byte's got nothing to say right now.";
    res.json({ reply });
  } catch (error) {
    console.error("Error handling webhook:", error.message);
    res.status(500).json({ error: "Byte tripped over her own sass again." });
  }
});

app.listen(port, () => {
  console.log(`ByteMe webhook is live on port ${port}`);
});
