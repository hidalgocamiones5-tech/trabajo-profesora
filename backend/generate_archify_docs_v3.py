import os
import django
import json
import math
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
    
    added_nodes = set()
    node_list = []

    def add_node_to_list(model_class, is_external=False):
        node_id = model_class.__name__.lower()
        if node_id in added_nodes:
            return node_id
        
        added_nodes.add(node_id)
        node_list.append({
            'id': node_id,
            'class_name': model_class.__name__,
            'app_label': model_class._meta.app_label,
            'is_external': is_external
        })
        return node_id

    for model in models:
        add_node_to_list(model)
        for field in model._meta.get_fields():
            if (field.many_to_one or field.many_to_many or field.one_to_one) and not field.auto_created:
                if field.related_model:
                    add_node_to_list(field.related_model, is_external=(field.related_model._meta.app_label != app_name))

    node_list.insert(0, {'id': 'frontend', 'class_name': 'Frontend UI', 'app_label': f'App {app_name}', 'is_external': False})
    node_list.insert(1, {'id': 'api_layer', 'class_name': f'API {app_name.capitalize()}', 'app_label': 'Django Views', 'is_external': False})

    N = len(node_list)
    cx, cy = 2000, 2000
    r = max(600, N * 60)

    for i, n in enumerate(node_list):
        # slight offset to avoid 0/90/180/270 exact angles which cause router side confusion
        angle = 2 * math.pi * i / N + 0.11
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        
        type_str = 'database'
        if n['id'] == 'frontend': type_str = 'frontend'
        elif n['id'] == 'api_layer': type_str = 'backend'
        
        sublabel = 'Model'
        if n['is_external']: sublabel = f"Model ({n['app_label']})"
        elif n['id'] in ('frontend', 'api_layer'): sublabel = n['app_label']

        components.append({
            'id': n['id'],
            'type': type_str,
            'label': n['class_name'],
            'sublabel': sublabel,
            'pos': [int(x), int(y)],
            'size': [200, 60],
            'tag': 'external' if n['is_external'] else ''
        })

    connections.append({'from': 'frontend', 'to': 'api_layer', 'variant': 'emphasis', 'route': 'straight'})
    
    for model in models:
        node_id = model.__name__.lower()
        connections.append({'from': 'api_layer', 'to': node_id, 'variant': 'dashed', 'route': 'straight'})
        for field in model._meta.get_fields():
            if (field.many_to_one or field.many_to_many or field.one_to_one) and not field.auto_created:
                if field.related_model:
                    to_id = field.related_model.__name__.lower()
                    connections.append({'from': node_id, 'to': to_id, 'variant': 'default', 'route': 'straight'})

    data = {
      'schema_version': 1,
      'diagram_type': 'architecture',
      'meta': {
        'title': f'Modulo: {app_name.capitalize()}',
        'subtitle': f'Modelos y relaciones de la aplicacion {app_name}',
        'output': f'app_{app_name}.html',
        'viewBox': [4000, 4000]
      },
      'components': components,
      'connections': connections
    }
    
    with open(f'../docs/architecture/app_{app_name}.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
