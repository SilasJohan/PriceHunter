"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function ProdutoDetalhes() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (url) {
      // Aqui vamos buscar o histórico que salvamos no banco usando a URL como ID
      fetch(`http://localhost:3001/api/product-history?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(json => setData(json));
    }
  }, [url]);

  if (!data) return <div className="p-20 text-center">Carregando análise de caça...</div>;

  return (
    <main className="min-h-screen bg-[#F5F5F7] p-8 text-[#1D1D1F]">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.history.back()} className="mb-8 text-[#0071E3] font-bold">← Voltar para a busca</button>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-200">
          <span className="text-orange-500 font-black text-xs uppercase tracking-widest">{data.store}</span>
          <h1 className="text-3xl font-bold mt-2 mb-6">{data.title}</h1>
          
          <div className="flex items-center gap-4 mb-10">
            <span className="text-5xl font-black text-gray-900">R$ {data.currentPrice}</span>
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
              MELHOR MOMENTO PARA COMPRAR
            </div>
          </div>

          <h2 className="text-lg font-bold mb-4 text-gray-500">Variação de Preço</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                   contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   labelFormatter={() => "Preço na data"}
                />
                <Line type="monotone" dataKey="price" stroke="#0071E3" strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <a href={data.url} target="_blank" className="mt-10 block w-full bg-[#0071E3] text-white text-center py-5 rounded-2xl font-bold text-xl hover:bg-[#0077ED] transition-all">
            Ir para a loja agora
          </a>
        </div>
      </div>
    </main>
  );
}