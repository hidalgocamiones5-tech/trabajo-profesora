import os
import django
import json
from django.apps import apps

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

app_name = 'api'
app_config = apps.get_app_config(app_name)
models = list(app_config.get_models())

components = []
components.append({'id': 'frontend', 'type': 'frontend', 'label': 'Frontend UI', 'sublabel': 'App api', 'row': 0, 'col': 1, 'size': [220, 60]})
components.append({'id': 'api_layer', 'type': 'backend', 'label': 'API Api', 'sublabel': 'Django Views', 'row': 1, 'col': 1, 'size': [220, 60]})

col = 0
row = 2

for model in models:
    components.append({
        'id': model.__name__.lower(),
        'type': 'database',
        'label': model.__name__,
        'sublabel': 'Model',
        'row': row,
        'col': col,
        'size': [220, 60]
    })
    col += 1
    if col > 3:
        col = 0
        row += 1

data = {
    'schema_version': 1,
    'diagram_type': 'architecture',
    'meta': {
    'title': 'Modulo: Api',
    'subtitle': 'Modelos de la aplicacion api',
    'output': 'app_api.html'
    },
    'layout': {
    'mode': 'grid',
    'origin': [40, 100],
    'cols': 4,
    'gapX': 24,
    'gapY': 48,
    'cellW': 220,
    'cellH': 60
    },
    'components': components,
    'connections': []
}

with open('../docs/architecture/app_api.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
