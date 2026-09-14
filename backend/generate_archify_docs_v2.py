import os
import django
import json
from django.apps import apps

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

local_apps = ['api', 'clientes', 'catalogo', 'rag_admin', 'privacidad', 'gestion_operativa', 'soporte']

for app_name in local_apps:
    try:
        app_config = apps.get_app_config(app_name)
    except LookupError:
        continue
    
    models = list(app_config.get_models())
    if not models:
        continue
        
    components = []
    connections = []
    
    # 1. Base components
    components.append({'id': 'frontend', 'type': 'frontend', 'label': 'Frontend UI', 'sublabel': f'App {app_name}', 'row': 0, 'col': 1, 'size': [220, 60]})
    components.append({'id': 'api_layer', 'type': 'backend', 'label': f'API {app_name.capitalize()}', 'sublabel': 'Django Views', 'row': 1, 'col': 1, 'size': [220, 60]})
    
    connections.append({'from': 'frontend', 'to': 'api_layer', 'variant': 'emphasis', 'fromSide': 'bottom', 'toSide': 'top'})
    
    # Track added nodes to avoid duplicates
    added_nodes = set(['frontend', 'api_layer'])
    
    row = 2
    col = 0
    
    def add_node(model_class, is_external=False):
        global row, col
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
            'col': col,
            'size': [220, 60],
            'tag': 'external' if is_external else ''
        })
        added_nodes.add(node_id)
        
        col += 1
        if col > 3:
            col = 0
            row += 1
            
        return node_id

    # 2. Add all models from this app
    for model in models:
        node_id = add_node(model)
        # Connect API to main models of this app
        connections.append({'from': 'api_layer', 'to': node_id, 'variant': 'dashed'})
        
    # 3. Add relations
    for model in models:
        from_id = model.__name__.lower()
        for field in model._meta.get_fields():
            if (field.many_to_one or field.many_to_many or field.one_to_one) and not field.auto_created:
                if field.related_model:
                    to_id = add_node(field.related_model, is_external=(field.related_model._meta.app_label != app_name))
                    # Add connection
                    connections.append({'from': from_id, 'to': to_id, 'variant': 'default'})

    data = {
      'schema_version': 1,
      'diagram_type': 'architecture',
      'meta': {
        'title': f'Modulo: {app_name.capitalize()}',
        'subtitle': f'Modelos y relaciones de la aplicacion {app_name}',
        'output': f'app_{app_name}.html'
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
      'connections': connections
    }
    
    with open(f'../docs/architecture/app_{app_name}.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f'Generated app_{app_name}.json with {len(components)} components and {len(connections)} connections.')
