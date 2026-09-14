import json
import glob
import os

files = glob.glob('../docs/architecture/*.json')
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if 'layout' in data and data['layout']['mode'] == 'grid':
        layout = data['layout']
        origin_x = layout.get('origin', [0,0])[0]
        origin_y = layout.get('origin', [0,0])[1]
        
        max_row = max((c.get('row', 0) for c in data.get('components', [])), default=0)
        max_col = max((c.get('col', 0) for c in data.get('components', [])), default=0)
        
        cellW = layout.get('cellW', 120)
        cellH = layout.get('cellH', 60)
        gapX = layout.get('gapX', 20)
        gapY = layout.get('gapY', 20)
        
        # Calculate bounding box
        width = origin_x + (max_col + 1) * (cellW + gapX) + 200
        height = origin_y + (max_row + 1) * (cellH + gapY) + 200
        
        # In Archify, viewBox is [width, height]
        if 'meta' in data:
            data['meta']['viewBox'] = [int(width), int(height)]
            
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
    print(f"Fixed {file}: width={width}, height={height}")
