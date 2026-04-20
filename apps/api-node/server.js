const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const app = express();

// 1. Segurança de Headers (Proteção contra Clickjacking, sniffing, etc)
app.use(helmet());

// 2. Controle de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

// 3. Limite de Payload (Evita ataques de negação de serviço com corpos gigantes)
app.use(express.json({ limit: '10kb' })); 

// 4. Rate Limiting (Proteção contra brute-force e bots)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Muitas requisições, tente novamente em 15 minutos." }
});
app.use('/api/', limiter);

// 5. Conexão Banco de Dados
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Conectado com sucesso"))
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 6. Rota de Busca com Validação Manual de Segurança
app.get('/api/search', async (req, res) => {
    try {
        let { url } = req.query;

        // SANITIZAÇÃO MANUAL: Remove caracteres que podem ser usados em ataques de script
        // No contexto de URL, queremos apenas caracteres válidos de URL
        if (url) {
            url = url.replace(/[<>\"\'\(\)]/g, ''); 
        }

        if (!url || !url.startsWith('https://www.mercadolivre.com.br')) {
            return res.status(400).json({ 
                error: "URL inválida. Por favor, use um link válido do Mercado Livre." 
            });
        }

        // Chama o Scraper Python
        const response = await axios.get(`http://localhost:8000/scrape?url=${encodeURIComponent(url)}`);
        const scrapedData = response.data;

        if (scrapedData.error) {
            return res.status(500).json({ error: scrapedData.error });
        }

        // Lógica de Banco de Dados (Atualizar ou Criar)
        let product = await Product.findOne({ url: scrapedData.url });

        if (product) {
            product.currentPrice = scrapedData.price;
            product.history.push({ price: scrapedData.price });
            product.lastUpdate = Date.now();
            await product.save();
        } else {
            product = await Product.create({
                title: scrapedData.title,
                url: scrapedData.url,
                store: scrapedData.store,
                currentPrice: scrapedData.price,
                history: [{ price: scrapedData.price }]
            });
        }

        res.json(product);
    } catch (error) {
        console.error("DEBUG - Erro detalhado:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            error: "Erro interno ao processar a busca.",
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🛡️  PriceHunter API Segura rodando na porta ${PORT}`);
});