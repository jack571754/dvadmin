"""Read-only source/URL inventory. No production DB access or request execution."""
import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RETIRED = ('web/src/views/plugins/dvadmin_portfolio/',
           'web/src/views/portfolio/')
METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']


def sources(root):
    return {p.relative_to(root).as_posix(): p for p in (root / 'web/src').rglob('*')
            if p.suffix in ('.vue', '.ts', '.tsx', '.js') and not p.relative_to(root).as_posix().startswith(RETIRED)}


def calls(files):
    result = []
    for name, path in sorted(files.items()):
        text = path.read_text(encoding='utf-8-sig')
        constants = dict(re.findall(r"(?:const|let|var)\s+(\w+)\s*=\s*['\"]([^'\"]+)['\"]", text))
        for match in re.finditer(r'\burl\s*:\s*([^\r\n,]+)', text):
            expression = match[1].strip()
            if expression.startswith(('http', '//')):
                continue
            value = None
            parts = re.split(r'\s*\+\s*', expression)
            pieces = []
            for part in parts:
                literal = re.fullmatch(r"(['\"])([^'\"]*)\1|`([^`]*)`", part)
                if literal:
                    pieces.append(re.sub(r'\$\{[^}]+\}', '{id}', literal[2] if literal[2] is not None else literal[3]))
                elif part in constants:
                    pieces.append(constants[part])
                elif len(parts) > 1:
                    pieces.append('{id}')
            if pieces:
                value = ''.join(pieces)
            tail = text[match.end():min(text.find('}', match.end()), match.end() + 180)]
            method = re.search(r"\bmethod\s*:\s*['\"](\w+)['\"]", tail)
            if value and not value.startswith(('/api/', 'api/')):
                continue
            result.append({'file': name, 'line': text.count('\n', 0, match.start()) + 1,
                           'expression': expression, 'url': '/' + value.lstrip('/') if value else None,
                           'method': method[1].upper() if method else None,
                           'verification': 'static_reference_only'})
    return result


def fixture_menus(root):
    rows = []
    paths = [root / 'backend/dvadmin/system/fixtures/init_menu.json']
    for plugin in ['dvadmin3_celery', 'dvadmin3_flow']:
        paths.extend((root / f'backend/plugins/{plugin}').rglob('init_menu.json'))

    def visit(items, source):
        for item in items:
            if not isinstance(item, dict):
                continue
            if item.get('web_path'):
                rows.append({'path': item['web_path'], 'name': item.get('name'), 'component': item.get('component'),
                             'fixture': source, 'buttons': item.get('menu_button', item.get('buttons', []))})
            visit(item.get('children', []), source)
    for path in paths:
        if path.exists():
            visit(json.loads(path.read_text(encoding='utf-8-sig')), path.relative_to(root).as_posix())
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=ROOT / 'docs/frontend-parity-matrix.json')
    args = parser.parse_args()
    old, new = sources(args.baseline), sources(ROOT)
    pages = []
    for name in sorted(set(old) | set(new)):
        if not name.startswith('web/src/views/'):
            continue
        state = 'added' if name not in old else 'missing' if name not in new else (
            'unchanged' if old[name].read_bytes() == new[name].read_bytes() else 'changed')
        pages.append({'file': name, 'source_status': state, 'functional_status': 'not_runtime_verified_by_inventory'})

    sys.path.insert(0, str(ROOT / 'backend'))
    os.environ['DJANGO_SETTINGS_MODULE'] = 'application.e2e_settings'
    import django
    django.setup()
    from django.urls import URLResolver, get_resolver, resolve, Resolver404
    routes = []

    def walk(patterns, prefix=''):
        for pattern in patterns:
            path = prefix + str(pattern.pattern)
            if isinstance(pattern, URLResolver):
                walk(pattern.url_patterns, path)
                continue
            callback = pattern.callback
            actions = getattr(callback, 'actions', {})
            cls = getattr(callback, 'cls', None)
            if not path.startswith('api/'):
                continue
            permissions = getattr(callback, 'initkwargs', {}).get('permission_classes', getattr(cls, 'permission_classes', []))
            routes.append({'pattern': path, 'name': pattern.name, 'actions': actions,
                           'view': f'{cls.__module__}.{cls.__name__}' if cls else getattr(callback, '__name__', ''),
                           'permissions': [getattr(item, '__name__', str(item)) for item in permissions]})
    walk(get_resolver().url_patterns)
    current_calls = calls(new)
    for call in current_calls:
        call['route_status'] = 'unresolved_expression'
        if call['url']:
            concrete = re.sub(r'\{[^}]+\}', '1', call['url']).split('?')[0]
            try:
                matched = resolve(concrete)
                actions = getattr(matched.func, 'actions', {})
                call['route_status'] = 'registered' if not call['method'] or not actions or call['method'].lower() in actions else 'method_mismatch'
                call['action'] = actions.get((call['method'] or '').lower())
            except Resolver404:
                call['route_status'] = 'not_registered'
    output = {'baseline': {'commit': 'e2e9c789ce7a2c32eab71aa89440049c64dcc41b',
                           'patch': 'p0-20261024-224722/working-tree.patch',
                           'excluded_intentionally_retired_prefixes': RETIRED},
              'limitations': ['Static references include templates and dynamic URLs; unresolved expressions require manual review.',
                              'File equality is not functional or security acceptance.',
                              'URL inventory uses isolated E2E settings and does not execute application requests.'],
              'pages': pages, 'baseline_menus': fixture_menus(args.baseline), 'current_menus': fixture_menus(ROOT),
              'baseline_calls': calls(old), 'current_calls': current_calls, 'backend_routes': routes}
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'page_source_status': {state: sum(p['source_status'] == state for p in pages)
                                           for state in ['unchanged', 'changed', 'added', 'missing']},
                      'current_calls': len(current_calls), 'routes': len(routes),
                      'suspicious_calls': [call for call in current_calls if call['route_status'] in ['not_registered', 'method_mismatch']]},
                     ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
