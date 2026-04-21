from fastapi import FastAPI
from core.mercadolivre import get_ml_data, search_ml  # Importamos os dois agora

app = FastAPI()

# Rota para link direto (o que já funcionava)
@app.get("/scrape")
async def scrape(url: str):
    return await get_ml_data(url)

# NOVA Rota para busca global por nome
@app.get("/search")
async def search(q: str):
    results = await search_ml(q)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)