"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/search?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      alert("Erro ao buscar produto");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-5xl font-bold mb-8 tracking-tighter">PriceHunter<span className="text-orange-500">.</span></h1>
        
        <div className="w-full max-w-2xl flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
          <input 
            type="text" 
            placeholder="Cole o link do Mercado Livre aqui..."
            className="flex-1 bg-transparent p-4 outline-none text-lg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={handleSearch}
            className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            {loading ? "Caçando..." : "Buscar"}
          </button>
        </div>

        {product && (
          <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-3xl w-full max-w-2xl animate-in fade-in zoom-in duration-500">
            <h2 className="text-xl font-medium text-gray-400 mb-2">{product.store}</h2>
            <h3 className="text-2xl font-bold mb-4">{product.title}</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-green-400">R$ {product.currentPrice}</span>
              <span className="text-gray-500 mb-1">à vista</span>
            </div>
            
            {/* Aqui entra o gráfico no futuro */}
            <div className="mt-6 h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 w-1/3 shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
            </div>
            <p className="mt-4 text-sm text-gray-500 italic">Preço monitorado com sucesso.</p>
          </div>
        )}
      </div>
    </main>
  );
}