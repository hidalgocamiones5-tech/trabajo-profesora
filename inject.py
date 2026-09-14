import os
import glob

html_files = glob.glob('docs/architecture/*.html')
button_html = '''
<div style="position: fixed; bottom: 20px; left: 20px; z-index: 99999;">
    <a href="../index.html" target="_top" style="background: #1e293b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #334155;">
        Volver al Menu Principal
    </a>
</div>
'''

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'Volver al Menu Principal' not in content:
        content = content.replace('</body>', button_html + '\n</body>')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
