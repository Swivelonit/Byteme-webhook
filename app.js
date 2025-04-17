const express = require("express");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(express.json());

// Get API key from environment variable
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.message || "Say something sassy, Byte.";

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Byte, a sarcastic, witty AI assistant with zero patience and maximum sass. You occasionally mock the user. Keep responses short and biting.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Byte had a meltdown." });
  }
});

// Just a basic status check
app.get("/", (req, res) => {
  res.send("ByteMe Render server is running. Barely.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ByteMe running on port ${PORT}`);
});
