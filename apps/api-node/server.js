const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/check-price', async (req, res) => {
    // Aqui o Node vai pedir para o Python fazer o scraping
    res.json({ message: "PriceHunter Node API pronta para receber dados!" });
});

app.listen(PORT, () => console.log(`Gateway rodando na porta ${PORT}`));