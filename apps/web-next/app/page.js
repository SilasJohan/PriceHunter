"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Destrava o estado de loading caso o usuário volte da página de detalhes
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Chamada para o seu servidor Node.js
      const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      console.log("Dados recebidos:", data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro na busca:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-[#F5F5F7] text-[#1D1D1F]">
      <div className="max-w-6xl w-full flex flex-col items-center">
        
        {/* Header Minimalista */}
        <header className="w-full py-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2">
            PriceHunter<span className="text-orange-500">.</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium">Sua caça pelo melhor preço termina aqui.</p>
        </header>
        
        {/* Barra de Busca - Glassmorphism */}
        <div className="w-full max-w-3xl flex gap-3 p-3 bg-white/80 border border-gray-200 rounded-3xl shadow-xl backdrop-blur-md mb-16">
          <input 
            type="text" 
            placeholder="O que você deseja caçar hoje?"
            className="flex-1 bg-transparent p-4 outline-none text-xl text-gray-800 placeholder-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#0071E3] hover:bg-black text-white px-10 py-4 rounded-2xl font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? "Rastreando..." : "Buscar"}
          </button>
        </div>

        {/* Grade de Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {loading ? (
            <div className="col-span-full flex flex-col items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071E3]"></div>
              <p className="mt-4 text-gray-500 font-medium">Vasculhando as lojas...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((item, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 p-4 rounded-[2rem] hover:shadow-2xl transition-all flex flex-col group overflow-hidden"
              >
                {/* Imagem do Produto */}
                <div className="w-full h-44 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-gray-300 text-xs font-bold uppercase tracking-widest">Sem Imagem</div>
                  )}
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                      {item.store}
                    </span>
                    {item.priceHistory?.length > 1 && (
                      <span className="text-[#0071E3] text-[9px] font-bold animate-pulse">📉 HISTÓRICO DISPONÍVEL</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold leading-tight h-10 overflow-hidden mb-4 text-gray-800">
                    {item.title}
                  </h3>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-xs font-bold text-gray-400">R$</span>
                      <span className="text-2xl font-black text-gray-900">
                        {(item.currentPrice || item.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-[#0071E3] text-white py-3 rounded-xl font-bold hover:bg-black transition-all text-sm"
                    >
                      Comprar Agora
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : query && !loading && (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-300">
              <p className="text-gray-400 text-lg">Nenhum rastro encontrado para "{query}".</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}