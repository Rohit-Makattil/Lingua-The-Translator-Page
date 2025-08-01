const express = require('express');
const { translate } = require('@vitalets/google-translate-api'); // Use named import
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/translate', async (req, res) => {
  const { text, from, to } = req.body;
  try {
    const result = await translate(text, { from, to });
    res.json({ translated: result.text });
  } catch (error) {
    console.error('Translation Error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});