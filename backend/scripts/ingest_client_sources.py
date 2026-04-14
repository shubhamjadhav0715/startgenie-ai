from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "data" / "client-rag-sources.json"
OUTPUT_PATH = ROOT / "data" / "public-knowledge-base.json"
REPORT_PATH = ROOT / "data" / "client-rag-ingest-report.json"

SECTION_RULES = {
    "overview": [
        "overview",
        "summary",
        "introduction",
        "vision",
        "objectives",
        "preamble",
        "ecosystem",
    ],
    "market_analysis": [
        "market",
        "industry",
        "demand",
        "consumer",
        "competition",
        "competitor",
        "trends",
        "ecosystem ranking",
        "report",
    ],
    "business_model": [
        "business model",
        "revenue",
        "pricing",
        "customer segment",
        "value proposition",
        "unit economics",
        "monetization",
    ],
    "swot": [
        "swot",
        "strength",
        "weakness",
        "opportunit",
        "threat",
        "challenge",
    ],
    "budget": [
        "budget",
        "cost",
        "capex",
        "opex",
        "expense",
        "financial outlay",
        "outlay",
    ],
    "funding": [
        "fund",
        "grant",
        "subsidy",
        "seed",
        "equity",
        "loan",
        "angel",
        "venture",
        "credit guarantee",
        "incentive",
        "reimbursement",
    ],
    "legal_compliance": [
        "legal",
        "compliance",
        "registration",
        "license",
        "incorporation",
        "tax",
        "gst",
        "labour",
        "labor",
        "patent",
        "ipr",
        "ip ",
        "copyright",
        "trademark",
        "dpiit",
        "certification",
    ],
    "go_to_market": [
        "go-to-market",
        "go to market",
        "distribution",
        "sales",
        "marketing",
        "channel",
        "customer acquisition",
        "market access",
        "procurement",
        "commercialisation",
    ],
    "roadmap": [
        "roadmap",
        "milestone",
        "phase",
        "timeline",
        "implementation",
        "action plan",
        "rollout",
        "next steps",
    ],
}

STATE_PATTERNS = {
    "telangana": "telangana",
    "west bengal": "west-bengal",
    "goa": "goa",
    "tamil nadu": "tamil-nadu",
    "maharashtra": "maharashtra",
}

RELEVANT_LINK_TERMS = [
    "startup",
    "scheme",
    "policy",
    "fund",
    "seed",
    "benefit",
    "recognition",
    "innovation",
    "msme",
    "procurement",
    "tax",
    "compliance",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def repair_text(text: str) -> str:
    fixed = str(text or "")
    replacements = {
        "â€“": "-",
        "â€”": "-",
        "â€˜": "'",
        "â€™": "'",
        "â€œ": '"',
        "â€�": '"',
        "â€¦": "...",
        "Â©": "Copyright",
        "Â®": "(R)",
        "Â": "",
    }
    for bad, good in replacements.items():
        fixed = fixed.replace(bad, good)
    return fixed


def normalize_whitespace(text: str) -> str:
    text = repair_text(text).replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def ascii_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return slug[:90] or "item"


def detect_states(text: str) -> list[str]:
    hay = text.lower()
    found = []
    for needle, slug in STATE_PATTERNS.items():
        if needle in hay:
            found.append(slug)
    return found


def infer_section_tags(text: str) -> list[str]:
    hay = text.lower()
    matched = []
    for section, keywords in SECTION_RULES.items():
        if any(keyword in hay for keyword in keywords):
            matched.append(section)
    if not matched:
        matched.append("overview")
    return matched


def infer_document_tags(name: str, text: str, base_tags: Iterable[str]) -> list[str]:
    hay = f"{name}\n{text}".lower()
    tags = set(base_tags)
    if "policy" in hay:
        tags.add("policy")
    if "scheme" in hay or "subsidy" in hay:
        tags.add("scheme")
    if "report" in hay or "summit" in hay:
        tags.add("report")
    if "legal" in hay or "compliance" in hay or "document" in hay:
        tags.add("legal")
    if "market" in hay:
        tags.add("market")
    if "fund" in hay or "grant" in hay or "seed" in hay:
        tags.add("funding")
    for state in detect_states(hay):
        tags.add(f"state:{state}")
    return sorted(tags)


def chunk_paragraphs(paragraphs: list[dict], max_chars: int = 1200) -> list[dict]:
    chunks: list[dict] = []
    current: list[str] = []
    pages: list[int] = []
    current_len = 0

    def flush() -> None:
        nonlocal current, pages, current_len
        if not current:
            return
        chunks.append(
            {
                "text": "\n\n".join(current),
                "page_start": min(pages) if pages else None,
                "page_end": max(pages) if pages else None,
            }
        )
        current = []
        pages = []
        current_len = 0

    for paragraph in paragraphs:
        text = normalize_whitespace(paragraph.get("text", ""))
        if not text:
            continue
        page = paragraph.get("page")
        projected = current_len + len(text) + (2 if current else 0)
        if current and projected > max_chars:
            flush()
        current.append(text)
        current_len += len(text) + (2 if current_len else 0)
        if isinstance(page, int):
            pages.append(page)

    flush()
    return chunks


def pdf_to_paragraphs(path: Path) -> list[dict]:
    reader = PdfReader(str(path))
    paragraphs: list[dict] = []
    for page_index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        cleaned = normalize_whitespace(text)
        if not cleaned:
            continue
        for piece in re.split(r"\n{2,}", cleaned):
            piece = normalize_whitespace(piece)
            if len(piece) < 80:
                continue
            paragraphs.append({"text": piece, "page": page_index})
    return paragraphs


def fetch_html(url: str, timeout: int = 20) -> tuple[str, str]:
    response = requests.get(
        url,
        timeout=timeout,
        headers={
            "User-Agent": "StartGenieAI-RAG-Ingest/2.0",
            "Accept": "text/html,application/xhtml+xml",
        },
    )
    response.raise_for_status()
    response.encoding = response.encoding or "utf-8"
    return response.text, response.url


def extract_clean_text(html: str) -> tuple[str, list[tuple[str, str]]]:
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "noscript", "svg", "header", "footer"]):
        tag.decompose()

    title = normalize_whitespace(soup.title.get_text(" ", strip=True) if soup.title else "")

    text_blocks = []
    for node in soup.find_all(["h1", "h2", "h3", "p", "li", "td"]):
        text = normalize_whitespace(node.get_text(" ", strip=True))
        if len(text) < 40:
            continue
        text_blocks.append(text)

    links: list[tuple[str, str]] = []
    for anchor in soup.find_all("a", href=True):
        href = normalize_whitespace(anchor["href"])
        label = normalize_whitespace(anchor.get_text(" ", strip=True))
        if not href:
            continue
        links.append((href, label))

    combined = normalize_whitespace("\n\n".join(([title] if title else []) + text_blocks))
    return combined, links


def choose_relevant_links(base_url: str, links: list[tuple[str, str]], max_pages: int) -> list[str]:
    base = urlparse(base_url)
    ranked: list[tuple[int, str]] = []
    seen = set()

    for href, label in links:
        absolute = urljoin(base_url, href)
        parsed = urlparse(absolute)
        parsed = parsed._replace(fragment="")
        normalized = urlunparse(parsed)
        if parsed.netloc != base.netloc:
            continue
        if normalized in seen:
            continue
        hay = f"{normalized} {label}".lower()
        score = sum(1 for term in RELEVANT_LINK_TERMS if term in hay)
        if score <= 0:
            continue
        seen.add(normalized)
        ranked.append((-score, normalized))

    ranked.sort()
    return [url for _, url in ranked[:max_pages]]


@dataclass
class SourceSummary:
    name: str
    kind: str
    items: int = 0
    chunks: int = 0


def build_entry(
    *,
    entry_id: str,
    title: str,
    content: str,
    tags: list[str],
    source_type: str,
    source_name: str,
    source_url: str | None = None,
    source_host: str | None = None,
    source_path: str | None = None,
    page_start: int | None = None,
    page_end: int | None = None,
) -> dict:
    return {
        "id": entry_id,
        "title": title,
        "tags": tags,
        "content": content,
        "sourceType": source_type,
        "sourceName": source_name,
        "sourceUrl": source_url or "",
        "sourceHost": source_host or "",
        "sourcePath": source_path or "",
        "pageStart": page_start,
        "pageEnd": page_end,
        "updatedAt": now_iso(),
    }


def process_pdf_source(source: dict, entries: list[dict], summary: SourceSummary) -> None:
    path = Path(source["path"])
    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")

    paragraphs = pdf_to_paragraphs(path)
    doc_name = source["name"]
    base_tags = infer_document_tags(doc_name, "\n".join(p["text"] for p in paragraphs[:25]), source.get("tags", []))
    chunks = chunk_paragraphs(paragraphs, max_chars=1200)

    for idx, chunk in enumerate(chunks, start=1):
        section_tags = infer_section_tags(chunk["text"])
        page_label = ""
        if chunk["page_start"]:
            page_label = f" (pages {chunk['page_start']}-{chunk['page_end']})"
        content = (
            f"Source document: {doc_name}.{page_label}\n"
            f"Section focus: {', '.join(section_tags)}.\n"
            f"Use this for Indian startup blueprint generation, especially where policy, schemes, funding, or compliance details matter.\n\n"
            f"{chunk['text']}"
        )
        tags = sorted(set(base_tags + [f"section:{section}" for section in section_tags] + ["client-source", "pdf"]))
        entries.append(
            build_entry(
                entry_id=f"client_pdf_{ascii_slug(doc_name)}_{idx}",
                title=doc_name,
                content=content,
                tags=tags,
                source_type="pdf",
                source_name=doc_name,
                source_path=str(path),
                page_start=chunk["page_start"],
                page_end=chunk["page_end"],
            )
        )

    summary.items += 1
    summary.chunks += len(chunks)


def process_web_page(source: dict, entries: list[dict], summary: SourceSummary) -> None:
    html, final_url = fetch_html(source["url"])
    text, _ = extract_clean_text(html)
    if not text:
        return

    paragraphs = [{"text": piece} for piece in re.split(r"\n{2,}", text) if len(normalize_whitespace(piece)) >= 80]
    chunks = chunk_paragraphs(paragraphs, max_chars=1200)
    base_tags = infer_document_tags(source["name"], text[:6000], source.get("tags", []))
    host = urlparse(final_url).netloc

    for idx, chunk in enumerate(chunks, start=1):
        section_tags = infer_section_tags(chunk["text"])
        content = (
            f"Source page: {source['name']}.\n"
            f"Page URL: {final_url}\n"
            f"Section focus: {', '.join(section_tags)}.\n"
            f"Use this as reference for startup blueprints in India.\n\n"
            f"{chunk['text']}"
        )
        tags = sorted(set(base_tags + [f"section:{section}" for section in section_tags] + ["client-source", "web"]))
        entries.append(
            build_entry(
                entry_id=f"client_web_{ascii_slug(source['name'])}_{idx}",
                title=source["name"],
                content=content,
                tags=tags,
                source_type="web",
                source_name=source["name"],
                source_url=final_url,
                source_host=host,
            )
        )

    summary.items += 1
    summary.chunks += len(chunks)


def process_web_crawl(source: dict, entries: list[dict], summary: SourceSummary) -> None:
    html, final_url = fetch_html(source["url"])
    text, links = extract_clean_text(html)
    targets = [final_url] + choose_relevant_links(final_url, links, max_pages=source.get("max_pages", 3))
    seen = set()

    for target in targets:
        if target in seen:
            continue
        seen.add(target)
        html, resolved_url = fetch_html(target)
        text, _ = extract_clean_text(html)
        if len(text) < 300:
            continue
        page_source = {
            "name": source["name"] if resolved_url == final_url else f"{source['name']} - {resolved_url}",
            "url": resolved_url,
            "tags": source.get("tags", []),
        }
        process_web_page(page_source, entries, summary)


def main() -> int:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    entries: list[dict] = []
    source_summaries: dict[str, SourceSummary] = {}
    errors: list[dict] = []

    for pdf_source in manifest.get("pdfs", []):
        summary = source_summaries.setdefault(pdf_source["name"], SourceSummary(name=pdf_source["name"], kind="pdf"))
        try:
            process_pdf_source(pdf_source, entries, summary)
        except Exception as exc:  # pragma: no cover - operational logging
            errors.append({"source": pdf_source["name"], "kind": "pdf", "error": str(exc)})

    for web_source in manifest.get("web", []):
        summary = source_summaries.setdefault(
            web_source["name"], SourceSummary(name=web_source["name"], kind=web_source.get("mode", "page"))
        )
        try:
            if web_source.get("mode") == "crawl":
                process_web_crawl(web_source, entries, summary)
            else:
                process_web_page(web_source, entries, summary)
        except Exception as exc:  # pragma: no cover - operational logging
            errors.append({"source": web_source["name"], "kind": "web", "error": str(exc)})

    entries.sort(key=lambda item: item["id"])
    OUTPUT_PATH.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")

    section_counts = Counter()
    tag_counts = Counter()
    source_counts = defaultdict(int)
    for entry in entries:
        for tag in entry.get("tags", []):
            tag_counts[tag] += 1
            if tag.startswith("section:"):
                section_counts[tag.replace("section:", "", 1)] += 1
        source_counts[entry.get("sourceName", "unknown")] += 1

    report = {
        "generatedAt": now_iso(),
        "manifestPath": str(MANIFEST_PATH),
        "outputPath": str(OUTPUT_PATH),
        "totalEntries": len(entries),
        "sources": [
            {
                "name": summary.name,
                "kind": summary.kind,
                "documentsProcessed": summary.items,
                "chunksCreated": summary.chunks,
            }
            for summary in sorted(source_summaries.values(), key=lambda item: item.name.lower())
        ],
        "sectionCoverage": dict(sorted(section_counts.items())),
        "topTags": tag_counts.most_common(25),
        "sourceChunkCounts": dict(sorted(source_counts.items())),
        "errors": errors,
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {len(entries)} entries to {OUTPUT_PATH}")
    print(f"Wrote ingest report to {REPORT_PATH}")
    if errors:
        print(f"Completed with {len(errors)} source errors", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
