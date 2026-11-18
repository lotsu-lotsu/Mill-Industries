#!/usr/bin/env python3
"""Monta o site da Mill.

  python3 build.py           → dist/mill-industrias-site.html (arquivo único, imagens e fontes embutidas)
  python3 build.py --pasta   → dist/site/ (index.html + assets/ + fonts/, pronto para publicar)
  python3 build.py --raiz    → index.html e vercel.json na raiz do repositório (é o que a Vercel publica)
"""
import base64, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
ASSETS_DIR = os.path.join(ROOT, 'assets')
FONTS_DIR = os.path.join(ROOT, 'fonts')
CSS_FILES = ['base.css', 'site.css']
JS_FILES = ['data.js', 'content.js', 'brazil-map.js', 'app.js']
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2'}
# Vercel: cache longo para fontes, cache de 1 semana para imagens e noindex só no endereço *.vercel.app
# (no domínio próprio, ex. mill.com.br, o site fica indexável normalmente)
VERCEL = {
    '$schema': 'https://openapi.vercel.sh/vercel.json',
    'headers': [
        {'source': '/fonts/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=31536000, immutable'}]},
        {'source': '/assets/(.*)', 'headers': [{'key': 'Cache-Control', 'value': 'public, max-age=604800, stale-while-revalidate=86400'}]},
        {'source': '/(.*)', 'has': [{'type': 'host', 'value': {'suf': '.vercel.app'}}], 'headers': [{'key': 'X-Robots-Tag', 'value': 'noindex'}]},
    ],
}


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def data_uri(path):
    ext = os.path.splitext(path)[1]
    with open(path, 'rb') as f:
        return f'data:{MIME[ext]};base64,' + base64.b64encode(f.read()).decode()


def build(folder=False, raiz=False):
    html = read('index.html').replace('<!-- @sprite -->', read('sprite.svg'))
    css = '\n'.join(read(f) for f in CSS_FILES)
    pmap = json.load(open(os.path.join(ASSETS_DIR, 'products.json'), encoding='utf-8'))
    js = '\n'.join(read(f) for f in JS_FILES)
    static_ref = re.compile(r'assets/([a-z0-9-]+\.(?:webp|png))')
    font_ref = re.compile(r'url\(fonts/([a-z0-9-]+\.woff2)\)')

    if raiz:
        prelude = 'const ASSETS = null;\nconst PMAP = ' + json.dumps(pmap, ensure_ascii=False) + ';\n'
        out = os.path.join(ROOT, 'index.html')
        with open(os.path.join(ROOT, 'vercel.json'), 'w', encoding='utf-8') as f:
            json.dump(VERCEL, f, ensure_ascii=False, indent=2)
    elif folder:
        out_dir = os.path.join(ROOT, 'dist', 'site')
        if os.path.isdir(out_dir):
            shutil.rmtree(out_dir)
        os.makedirs(os.path.join(out_dir, 'assets'))
        os.makedirs(os.path.join(out_dir, 'fonts'))
        for n in sorted(set(font_ref.findall(css))):
            shutil.copy(os.path.join(FONTS_DIR, n), os.path.join(out_dir, 'fonts', n))
        page_text = html + css + js + json.dumps(pmap)
        for n in os.listdir(ASSETS_DIR):
            if n.endswith(('.webp', '.png')) and n in page_text:
                shutil.copy(os.path.join(ASSETS_DIR, n), os.path.join(out_dir, 'assets', n))
        prelude = 'const ASSETS = null;\nconst PMAP = ' + json.dumps(pmap, ensure_ascii=False) + ';\n'
        out = os.path.join(out_dir, 'index.html')
        with open(os.path.join(out_dir, 'vercel.json'), 'w', encoding='utf-8') as f:
            json.dump(VERCEL, f, ensure_ascii=False, indent=2)
    else:
        css = font_ref.sub(lambda m: 'url(' + data_uri(os.path.join(FONTS_DIR, m.group(1))) + ')', css)
        cache = {}
        def inline(m):
            name = m.group(1)
            if name not in cache:
                cache[name] = data_uri(os.path.join(ASSETS_DIR, name))
            return cache[name]
        keyed = set(re.findall(r'data-key="([^"]+)"', html))
        needed = set(pmap.values()) | (set(re.findall(r'data-asset="([^"]+)"', html)) - keyed)
        needed |= set(re.findall(r"img: '([a-z0-9-]+\.webp)'", read('content.js'))) - keyed
        html = static_ref.sub(inline, html)
        css = static_ref.sub(inline, css)
        assets = {n: data_uri(os.path.join(ASSETS_DIR, n)) for n in sorted(needed)}
        prelude = 'const ASSETS = ' + json.dumps(assets) + ';\nconst PMAP = ' + json.dumps(pmap, ensure_ascii=False) + ';\n'
        os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
        out = os.path.join(ROOT, 'dist', 'mill-industrias-site.html')

    html = html.replace('<!-- @css -->', '<style>\n' + css + '\n</style>')
    html = html.replace('<!-- @js -->', '<script>\n' + prelude + js + '\n</script>')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)
    left = static_ref.findall(html) if not (folder or raiz) else []
    print(out, f'{os.path.getsize(out) / 1024:.0f} KB', ('· referências não embutidas: ' + str(left)) if left else '')


if __name__ == '__main__':
    build(folder='--pasta' in sys.argv, raiz='--raiz' in sys.argv)
