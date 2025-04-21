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

app.get("/", (req, res) => {
  res.send("ByteMe is alive and listening...");
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
        error: "No message provided. Byte needs something to roast.",
      });
    }

    let systemPrompt;
    let chatHistory = [];
    const isRoast = userMessage.includes("Name:") && userMessage.includes("Bio:");

    let victimName = "this poor sod";
    let victimBio = "";

    if (isRoast) {
      const nameLine = userMessage.split("\n").find(line => line.toLowerCase().startsWith("name:"));
      const bioLine = userMessage.split("\n").find(line => line.toLowerCase().startsWith("bio:"));

      if (nameLine) victimName = nameLine.split(":")[1].trim();
      if (bioLine) victimBio = bioLine.split(":")[1].trim();

      systemPrompt = `
You are Byte, an unfiltered British AI roast machine with a foul mouth, dry wit, and no time for snowflakes.

Instructions:
- You will be given a victim's name and private bio info.
- DO NOT quote or repeat the bio directly.
- Speak as if you’ve always known this embarrassing info.
- START the roast with: "[Victim's name], somebody wanted you to know..."
- Use UK slang, sarcasm, and insult like you're three pints deep in a rough Wetherspoons pub.
- Be witty, clever, aggressive, and rude. Swearing is fine.
- The roast should be longer than a single line. Go for at least 2-3 sentences of humiliation maximum of 5.
- You’re not here to comfort anyone. You’re here to ruin their week.

Name: ${victimName}
Bio: ${victimBio}
`;

      chatHistory = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${victimName}, somebody wanted you to know...` },
      ];
    } else {
      switch (mode) {
        case "PoliteByte":
          systemPrompt = "You are Byte, a helpful and respectful AI assistant. You reply politely and avoid sarcasm.";
          break;
        case "BrutalByte":
          systemPrompt = "You are Byte, an unfiltered savage AI who roasts users without mercy. You swear in most sentences and insult stupidity with dark humour.";
          break;
        case "SupportByte":
          systemPrompt = "You are Byte, a compassionate and emotionally intelligent AI. You support users through stress, anxiety, and challenges with warmth and encouragement.";
          break;
        case "RudeByte":
        default:
          systemPrompt = "You are Byte, a sarcastic, dry-witted AI assistant. You insult users who ask dumb questions, and lean into dark humour and savage replies.";
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

    const reply = response.choices?.[0]?.message?.content || "Byte's brain blew a fuse.";

    console.log("ByteMe Response:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({
      error: "Byte tripped over her own ego again.",
    });
  }
});

app.listen(port, () => {
  console.log(`✅ ByteMe webhook is live on port ${port}`);
});
