"""Auto-sync: Google Doc -> Parser -> Syntax Converter -> Formatter -> assets/privacy-content.html"""
import re,sys,datetime,pathlib,urllib.request,markdown
DOC_ID='16Xf72jKGM76vqhVBgtLfq_2a4ZgKjjlR_KNXi_hEdNw'
OUT=pathlib.Path('assets/privacy-content.html')
def fetch(fmt):
    req=urllib.request.Request(f'https://docs.google.com/document/d/{DOC_ID}/export?format={fmt}',headers={'User-Agent':'Mozilla/5.0'})
    return urllib.request.urlopen(req,timeout=30).read().decode('utf-8')
def parse(md):  # PARSER: strip Google export noise
    md=md.replace('\r','').replace('\u00a0',' ')
    md=re.sub(r'^\[image\d+\]:.*$','',md,flags=re.M)
    md=re.sub(r'!\[[^\]]*\](\[[^\]]*\]|\([^)]*\))','',md)
    return re.sub(r'\n{3,}','\n\n',md).strip()
def convert(md):  # SYNTAX CONVERTER: Markdown -> HTML
    return markdown.markdown(md,extensions=['extra','sane_lists','tables'])
def slug(t): return re.sub(r'[^a-z0-9]+','-',re.sub('<[^>]+>','',t).lower()).strip('-')
def fmt(h):  # FORMATTER: clean, anchors, safe links
    h=re.sub(r'<p>\s*(&nbsp;)?\s*</p>','',h)
    h=re.sub(r'<(h[1-4])>(.*?)</\1>',lambda m:f'<{m[1]} id="{slug(m[2])}">{m[2]}</{m[1]}>',h)
    h=re.sub(r'<a href="(https?://[^"]+)"',r'<a target="_blank" rel="noopener noreferrer" href="\1"',h)
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%B %d, %Y %H:%M UTC')
    return f'<div class="policy">{h}<p class="sync">Last synced from source: {stamp}</p></div>'
try: md=fetch('md')
except Exception as e: print('md export failed:',e); md=fetch('txt')
out=fmt(convert(parse(md)))
if len(out)<300: sys.exit('Fetched policy looks empty. Is the Doc shared as "Anyone with the link: Viewer"?')
old=OUT.read_text() if OUT.exists() else ''
strip=lambda s:re.sub(r'Last synced.*?</p>','',s)
if strip(old)!=strip(out): OUT.write_text(out); print('Updated')
else: print('No content change')
