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
connections = []

components.append({'id': 'frontend', 'type': 'frontend', 'label': 'Frontend UI', 'sublabel': 'App api', 'row': 0, 'col': 0, 'size': [220, 60]})
components.append({'id': 'api_layer', 'type': 'backend', 'label': 'API Api', 'sublabel': 'Django Views', 'row': 1, 'col': 0, 'size': [220, 60]})

connections.append({'from': 'frontend', 'to': 'api_layer', 'variant': 'emphasis', 'fromSide': 'right', 'toSide': 'right'})

added_nodes = set(['frontend', 'api_layer'])
row = 2

def add_node(model_class, is_external=False):
    global row
    node_id = model_class.__name__.lower()
    if node_id in added_nodes:
        return node_id
        
    app_label = model_class._meta.app_label
    sublabel = f'Model ({app_label})' if is_external else 'Model'
    
    components.append({
        'id': node_id,
        'type': 'database',
        'label': model_class.__name__,
        'sublabel': sublabel,
        'row': row,
        'col': 0,
        'size': [220, 60],
        'tag': 'external' if is_external else ''
    })
    added_nodes.add(node_id)
    row += 1
    return node_id

for model in models:
    node_id = add_node(model)
    connections.append({'from': 'api_layer', 'to': node_id, 'variant': 'dashed', 'fromSide': 'left', 'toSide': 'left'})
    
for model in models:
    from_id = model.__name__.lower()
    for field in model._meta.get_fields():
        if (field.many_to_one or field.many_to_many or field.one_to_one) and not field.auto_created:
            if field.related_model:
                to_id = add_node(field.related_model, is_external=(field.related_model._meta.app_label != app_name))
                connections.append({'from': from_id, 'to': to_id, 'variant': 'default', 'fromSide': 'right', 'toSide': 'right'})

data = {
  'schema_version': 1,
  'diagram_type': 'architecture',
  'meta': {
    'title': 'Modulo: Api',
    'subtitle': 'Modelos y relaciones de la aplicacion api',
    'output': 'app_api.html',
    'viewBox': [6000, 15000]
  },
  'layout': {
    'mode': 'grid',
    'origin': [1000, 100],
    'cols': 1,
    'gapX': 100,
    'gapY': 100,
    'cellW': 220,
    'cellH': 60
  },
  'components': components,
  'connections': connections
}

with open('../docs/architecture/app_api.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
