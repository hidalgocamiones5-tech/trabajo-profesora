import json

data = {
  'schema_version': 1,
  'diagram_type': 'dataflow',
  'meta': {
    'title': 'Test',
    'output': 'test.html',
    'viewBox': [2000, 2000]
  },
  'nodes': [
    {'id': 'a', 'type': 'backend', 'label': 'A', 'pos': [100, 100]},
    {'id': 'b', 'type': 'backend', 'label': 'B', 'pos': [500, 500]}
  ],
  'edges': [
    {'from': 'a', 'to': 'b'}
  ]
}
with open('test.json', 'w') as f:
    json.dump(data, f)
