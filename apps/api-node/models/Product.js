const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    price: Number,
    date: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true }, // Não queremos duplicar o mesmo link
    store: String,
    currentPrice: Number,
    currency: { type: String, default: 'BRL' },
    history: [priceHistorySchema], // Array com todos os preços capturados ao longo do tempo
    lastUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);