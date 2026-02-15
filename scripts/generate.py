import os
import json

# Caminho absoluto baseado na localização do script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
base_dir = os.path.join(project_root, 'artes-toalhas')
output_file = os.path.join(base_dir, 'manifest.json')

images = []
id_counter = 1

print(f"--- Iniciando varredura em: {base_dir} ---")

if os.path.exists(base_dir):
    for category in os.listdir(base_dir):
        cat_path = os.path.join(base_dir, category)
        if os.path.isdir(cat_path):
            for filename in os.listdir(cat_path):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp')):
                    # Caminho para o navegador
                    web_url = f'artes-toalhas/{category}/{filename}'
                    images.append({
                        'id': id_counter,
                        'theme': category,
                        'name': filename,
                        'url': web_url
                    })
                    id_counter += 1
                    print(f"Achou: {category}/{filename}")

    try:
        with open(output_file, 'w') as f:
            json.dump(images, f)
        print("--- manifest.json gerado com sucesso! ---")
    except Exception as e:
        print(f"Erro ao salvar JSON: {e}")
else:
    print(f"ERRO: Pasta {base_dir} não encontrada. Verifique se o volume foi montado corretamente.")