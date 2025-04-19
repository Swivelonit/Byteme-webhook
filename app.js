const express = require("express");
const bodyParser = require("body-parser");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT; // ✅ Render sets this automatically

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());

// ✅ Optional: Allow all origins (CORS safety net)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// ✅ Alive check
app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
});

// ✅ Main webhook
app.post("/webhook", async (req, res) => {
  try {
    console.log("=== Incoming Payload ===");
    console.log(JSON.stringify(req.body, null, 2));

    const userMessage = req.body.message;
    const mode = req.body.mode || "RudeByte";

    console.log("User message:", userMessage);
    console.log("Requested personality mode:", mode);

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided. Byte needs *something* to
