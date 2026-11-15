#!/usr/bin/env python3
"""Check the built site in public/ for the SEO rules in AGENTS.md.

Run after `hugo --cleanDestinationDir`:

    python3 scripts/seo-check.py

Exits non-zero if any error is found. Warnings don't fail the run.
"""
import glob
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
CONTENT = ROOT / "content" / "posts"

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def front_matter(path):
    text = path.read_text()
    m = re.match(r"^(---|\+\+\+)\n(.*?)\n\1", text, re.S)  # YAML or TOML
    return m.group(2) if m else ""


def fm_value(fm, key):
    m = re.search(rf"^{key}\s*[:=]\s*(.+)$", fm, re.M | re.I)
    return m.group(1).strip().strip("'\"") if m else None


# 1. No dev-server URLs in the build.
for f in glob.glob(str(PUBLIC / "**" / "*"), recursive=True):
    p = Path(f)
    if p.is_file() and p.suffix in {".html", ".xml", ".txt", ".json"}:
        if "localhost" in p.read_text(errors="ignore"):
            err(f"localhost URL in {p.relative_to(ROOT)} (hugo server overwrote public/; rebuild)")

# 2. Front matter on published posts.
for md in sorted(CONTENT.glob("*.md")):
    fm = front_matter(md)
    if (fm_value(fm, "draft") or "false").lower() == "true":
        continue
    name = md.name
    desc = fm_value(fm, "description")
    if not desc:
        err(f"{name}: missing description")
    else:
        if len(desc) > 160:
            warn(f"{name}: description is {len(desc)} chars (Google cuts at ~155-160)")
        if re.search(r"\.\s+[a-z]", desc):
            warn(f"{name}: description has a lowercase letter after a full stop")
    title = fm_value(fm, "seoTitle") or fm_value(fm, "title") or ""
    if len(title) > 70:
        warn(f"{name}: search title is {len(title)} chars (Google shows ~60)")
    if not re.search(r"^keywords\s*[:=]", fm, re.M):
        warn(f"{name}: no keywords in front matter")

# 3. Structured data on every built page.
ld_re = re.compile(r'<script type="?application/ld\+json"?>(.*?)</script>', re.S)
for f in sorted(glob.glob(str(PUBLIC / "**" / "index.html"), recursive=True)):
    rel = Path(f).relative_to(ROOT)
    html = Path(f).read_text()
    for block in ld_re.findall(html):
        try:
            data = json.loads(block)
        except json.JSONDecodeError as e:
            err(f"{rel}: invalid JSON-LD ({e})")
            continue
        kind = data.get("@type")
        if kind == "BreadcrumbList":
            items = data.get("itemListElement", [])
            if len(items) < 2:
                err(f"{rel}: breadcrumb has {len(items)} item(s); Google needs at least 2")
            for i, item in enumerate(items, 1):
                missing = [k for k in ("position", "name", "item") if k not in item]
                if missing:
                    err(f"{rel}: breadcrumb item {i} missing {missing}")
                elif item["position"] != i:
                    err(f"{rel}: breadcrumb positions out of order")
        elif kind == "BlogPosting" and "/posts/" in str(rel):
            for k in ("headline", "image", "datePublished", "dateModified", "author", "publisher"):
                if not data.get(k):
                    err(f"{rel}: BlogPosting missing {k}")
            author = data.get("author") or {}
            if isinstance(author, dict) and not author.get("url"):
                warn(f"{rel}: author has no url")

# 4. Machine-readable files.
for path in ("llms.txt", "robots.txt", "sitemap.xml", "index.xml", "_headers"):
    if not (PUBLIC / path).exists():
        err(f"public/{path} is missing")
for path in (".well-known/ai-catalog.json", ".well-known/ard.json"):
    p = PUBLIC / path
    if not p.exists():
        err(f"public/{path} is missing")
        continue
    try:
        data = json.loads(p.read_text())
        if "specVersion" not in data or not data.get("entries"):
            err(f"public/{path}: needs specVersion and a non-empty entries array")
    except json.JSONDecodeError as e:
        err(f"public/{path}: invalid JSON ({e})")

robots = (PUBLIC / "robots.txt").read_text() if (PUBLIC / "robots.txt").exists() else ""
allowed = ("user-agent", "disallow", "allow", "sitemap", "crawl-delay")
for line in robots.splitlines():
    if line.strip() and not line.startswith("#"):
        if line.split(":", 1)[0].strip().lower() not in allowed:
            err(f"robots.txt: unknown directive '{line}' (Lighthouse flags it)")

# 5. Every OG image a page references must exist in public/.
for f in glob.glob(str(PUBLIC / "**" / "*.html"), recursive=True):
    for og in set(re.findall(r"/og/([\w.-]+\.(?:jpg|png))", Path(f).read_text())):
        if not (PUBLIC / "og" / og).exists():
            err(f"{Path(f).relative_to(ROOT)}: references missing /og/{og}")

for w in warnings:
    print(f"warn:  {w}")
for e in errors:
    print(f"error: {e}")
print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
sys.exit(1 if errors else 0)
