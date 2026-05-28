import os
import re

for f in os.listdir('.'):
    if f.endswith('.html'):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            print(f"--- {f} ---")
            
            # Simple regex to find a tags and their text
            a_tags = re.findall(r'<a[^>]*>(.*?)</a>', content, re.DOTALL | re.IGNORECASE)
            for text in a_tags:
                clean_text = re.sub(r'<[^>]+>', '', text).strip()
                if clean_text:
                    print(f"A: {clean_text}")
                    
            btn_tags = re.findall(r'<button[^>]*>(.*?)</button>', content, re.DOTALL | re.IGNORECASE)
            for text in btn_tags:
                clean_text = re.sub(r'<[^>]+>', '', text).strip()
                if clean_text:
                    print(f"BTN: {clean_text}")
