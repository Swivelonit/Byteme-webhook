const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('Received POST:', req.body);
  res.json({ reply: 'ByteMe is alive and listening through Render!' });
});

app.get('/', (req, res) => {
  res.send('ByteMe Render Server is running ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
