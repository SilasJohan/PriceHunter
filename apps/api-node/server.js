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
app.use(cors());

// 3. Limite de Payload (Evita ataques de negação de serviço com corpos gigantes)
app.use(express.json({ limit: '10kb' })); 

// 4. Rate Limiting (Proteção contra brute-force e bots)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Muitas requisições, tente novamente em 15 minutos." }
});
//app.use('/api/', limiter); TEMPORIRAMENTE FODASE NIGGER GAY

// 5. Conexão Banco de Dados
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Conectado com sucesso"))
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 6. Rota de Busca com Validação Manual de Segurança
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query vazia" });

    try {
        console.log(`🔍 Iniciando busca por: ${q}`);
        
        // 1. Chama o Python
        const response = await axios.get(`http://localhost:8000/search?q=${encodeURIComponent(q)}`);
        const scrapedProducts = response.data;

        console.log(`🐍 Python retornou ${scrapedProducts.length} itens.`);

        if (scrapedProducts.length === 0) {
            return res.json([]); // Se o Python falhou, para aqui.
        }

        // 2. Tenta salvar/atualizar no MongoDB
        const productsWithHistory = await Promise.all(scrapedProducts.map(async (item) => {
            try {
                let product = await Product.findOne({ url: item.url });

                if (product) {
                    if (product.currentPrice !== item.price) {
                        product.priceHistory.push({ price: item.price });
                        product.currentPrice = item.price;
                        await product.save();
                    }
                    return product;
                } else {
                    const newProduct = new Product({
                        title: item.title,
                        currentPrice: item.price,
                        image: item.image,
                        url: item.url,
                        store: item.store,
                        priceHistory: [{ price: item.price }]
                    });
                    return await newProduct.save();
                }
            } catch (err) {
                console.error("❌ Erro ao salvar item no banco:", err);
                return item; // Se o banco falhar, retorna o item bruto do scraper
            }
        }));

        console.log(`✅ Enviando ${productsWithHistory.length} itens para o Front.`);
        res.json(productsWithHistory);

    } catch (error) {
        console.error("💥 Erro Crítico na Rota de Busca:", error.message);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

app.get('/api/product-history', async (req, res) => {
    const { url } = req.query;
    try {
        const product = await Product.findOne({ url: url });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🛡️  PriceHunter API Segura rodando na porta ${PORT}`);
});