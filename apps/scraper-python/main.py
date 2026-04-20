from fastapi import FastAPI
from core.mercadolivre import get_ml_data

app = FastAPI()

@app.get("/scrape")
async def scrape(url: str):
    # Aqui chamamos a função que criamos no arquivo core/mercadolivre.py
    result = await get_ml_data(url)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)