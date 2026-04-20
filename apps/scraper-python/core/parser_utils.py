import re

def clean_price(price_text):
    """
    Transforma 'R$ 1.299,90' em 1299.9
    Essencial para cálculos de variação e ROI de descontos.
    """
    if not price_text:
        return 0.0
    
    # Remove tudo que não é número, vírgula ou ponto
    cleaned = re.sub(r'[^\d,\.]', '', price_text)
    
    # Lógica para converter padrão brasileiro (1.299,90) para float (1299.90)
    if ',' in cleaned and '.' in cleaned:
        cleaned = cleaned.replace('.', '').replace(',', '.')
    elif ',' in cleaned:
        cleaned = cleaned.replace(',', '.')
        
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

# Teste rápido
# print(clean_price("R$ 4.599,00")) -> 4599.0