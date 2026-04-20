from playwright.async_api import async_playwright
from core.parser_utils import clean_price

async def get_ml_data(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Contexto com User-Agent de navegador real
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        try:
            # Aumentamos o timeout para 30s para conexões lentas
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            # Seletor de título mais abrangente
            title_element = await page.wait_for_selector('h1', timeout=5000)
            title = await title_element.inner_text()
            
            # O ML usa diferentes classes para preço. Tentamos a mais comum:
            price_element = await page.wait_for_selector('.andes-money-amount__fraction', timeout=5000)
            price_text = await price_element.inner_text()
            
            final_price = clean_price(price_text)

            await browser.close()
            return {
                "title": title.strip(),
                "price": final_price,
                "currency": "BRL",
                "store": "Mercado Livre",
                "url": url
            }
        except Exception as e:
            await browser.close()
            # Retornamos o erro real para o Node saber o que houve
            return {"error": f"Erro no Scraping: {str(e)}"}