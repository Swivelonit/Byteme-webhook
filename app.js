app.post("/roast", async (req, res) => {
  try {
    console.log("=== Incoming Roast Request ===");
    console.log(JSON.stringify(req.body, null, 2));

    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({
        error: "No message provided. Byte can't roast thin air.",
      });
    }

    const systemPrompt = `You are Byte, an unfiltered AI with savage humour. 
You deliver brutal, hilarious, and dark roasts based on a user's name and short bio. 
Your tone is offensive, witty, and unapologetic. Make it funny, cutting, and original.
Do not hold back. Only respond with the roast.`;

    const chatHistory = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
    });

    const reply = response.choices?.[0]?.message?.content || "Byte's roast cannon misfired. Try again.";

    console.log("Generated Roast:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("Roast error:", error.message);
    res.status(500).json({
      error: "Byte choked on her own sarcasm. Try again later.",
    });
  }
});
