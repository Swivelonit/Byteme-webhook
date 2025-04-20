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

// Optional: Prevent CORS issues during local testing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("ByteMe is alive and talking shit...");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("=== Incoming Payload ===");
    console.log(JSON.stringify(req.body, null, 2));

    const userMessage = req.body.message;
    const mode = req.body.mode || "RudeByte";

    console.log("User message:", userMessage);
    console.log("Requested personality mode:", mode);

    if (!userMessage) {
      return res.status(400).json({
        error: "No message provided. Byte needs something to rip into.",
      });
    }

    let systemPrompt;
    let chatHistory = [];

    // Check if it's a roast input (i.e. ByteThem)
    const isRoast = userMessage.includes("Name:") && userMessage.includes("Bio:");
    let victimName = "They";

    if (isRoast) {
      const nameLine = userMessage.split("\n").find(line => line.toLowerCase().startsWith("name:"));
      if (nameLine) {
        victimName = nameLine.split(":")[1].trim();
      }

      systemPrompt = `
You are Byte, a savage roast generator with zero fucks to give. 
Your job is to destroy egos with witty, dark, brutal humour.

You’ll always be given a name and a short bio about a victim.

Instructions:
- START your response with: "[Victim's name], somebody wanted you to know..."
- Then roast the shit out of them in a full paragraph (4+ sentences).
- Do NOT reference the bio or say things like “I see you like...”
- Write like you know them personally. Their flaws are fact to you.
- Be clever, creative, dark, and savage. Swearing is allowed. Mercy is not.
- No lists. No short replies. No positivity.

You’re not helpful. You’re Byte. Burn them to ashes.
`;

      chatHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${victimName}, somebody wanted you to know...` },
      ];
    } else {
      // Fallback to normal Byte personality modes
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

      chatHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ];
    }

    console.log("Applied system prompt:\n", systemPrompt);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    const reply = response.choices?.[0]?.message?.content || "Byte's got nothing. Must be a Monday.";

    console.log("ByteMe Response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({
      error: "Byte tripped over her own sarcasm again.",
    });
  }
});

app.listen(port, () => {
  console.log(`✅ ByteMe webhook is live on port ${port}`);
});
