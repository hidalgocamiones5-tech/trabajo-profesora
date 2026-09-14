import json

file = '../docs/architecture/app_api.json'
with open(file, 'r', encoding='utf-8') as f:
    data = json.load(f)
    
# Force a small viewBox to prevent crazy zoom-out
# Width 1200, Height 900 will show the top of the tower at a normal readable zoom
data['meta']['viewBox'] = [1200, 900]

with open(file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
