from playwright.async_api import async_playwright
from core.parser_utils import clean_price

# FUNÇÃO 1: Para links diretos
async def get_ml_data(url: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            title = await page.locator('h1.ui-pdp-title').inner_text()
            price_element = await page.locator('.andes-money-amount__fraction').first.inner_text()
            
            await browser.close()
            return {
                "title": title.strip(),
                "price": clean_price(price_element),
                "currency": "BRL",
                "store": "Mercado Livre",
                "url": url
            }
        except Exception as e:
            await browser.close()
            return {"error": str(e)}

# FUNÇÃO 2: Busca corrigida e sem bugs
async def search_ml(query: str):
    browser = None
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            search_url = f"https://lista.mercadolivre.com.br/{query.replace(' ', '-')}"
            
            # 1. Primeiro navegamos para a página
            await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            
            # 2. Agora sim fazemos o scroll para carregar as imagens (Lazy Loading)
            await page.mouse.wheel(0, 1000)
            await page.wait_for_timeout(800) # Pequena pausa para as imagens aparecerem

            # 3. Esperamos o seletor principal
            await page.wait_for_selector('h2', timeout=10000)

            products = []
            items = await page.query_selector_all('.ui-search-result__wrapper, .poly-card, li')

            print(f"📦 Itens brutos detectados: {len(items)}")

            for item in items:
                try:
                    # --- LINK E FILTRO ANTI-HOME ---
                    link_el = await item.query_selector('a.ui-search-link, a.poly-component__title')
                    if not link_el: continue
                    
                    url_raw = await link_el.get_attribute('href') or ""
                    clean_link = url_raw.split('#')[0].split('?')[0]

                    # Filtro crítico: Se o link não tiver "MLB" ou "/p/", é link de propaganda/home.
                    if "MLB" not in clean_link and "/p/" not in clean_link:
                        continue

                    # --- TÍTULO ---
                    title_el = await item.query_selector('h2')
                    if not title_el: continue
                    title = await title_el.inner_text()
                    
                    if "kit" in title.lower() and "kit" not in query.lower():
                        continue

                    # --- PREÇO ---
                    price_el = await item.query_selector('.andes-money-amount__fraction')
                    price_text = await price_el.inner_text() if price_el else "0"

                    # --- IMAGEM (Lógica de múltiplos atributos) ---
                    img_el = await item.query_selector('img')
                    image_url = ""
                    if img_el:
                        # O ML guarda a imagem real no data-src ou srcset antes de carregar
                        image_url = await img_el.get_attribute('data-src') or \
                                   await img_el.get_attribute('srcset') or \
                                   await img_el.get_attribute('src') or ""
                        
                        # Limpa o srcset se ele vier com múltiplas resoluções
                        if "," in image_url:
                            image_url = image_url.split(' ')[0]

                    products.append({
                        "title": title.strip(),
                        "price": clean_price(price_text),
                        "url": clean_link,
                        "image": image_url,
                        "store": "Mercado Livre"
                    })
                    
                    if len(products) >= 12: break # Limite de resultados

                except Exception as e:
                    continue
            
            print(f"✅ Sucesso! {len(products)} produtos reais extraídos.")
            return products
            
    except Exception as e:
        print(f"❌ Erro Crítico no Scraper: {e}")
        return []
    finally:
        if browser: await browser.close()