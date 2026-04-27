## Teknis: Essay Text Highlighting

### Pendekatan — span extraction via JSON

Jangan minta model return `start_char`/`end_char` — LLM sering off-by-one. Lebih reliable: minta model return **kutipan teks eksak**, lalu lakukan string matching di backend.

---

### 1. Prompt ke Gemini 3.1 Flash-Lite

```python
HIGHLIGHT_PROMPT = """
Kamu adalah asisten penilaian esai. Analisis esai berikut dan identifikasi
maksimal 8 bagian teks yang penting untuk dinilai.

Untuk setiap bagian, return kutipan PERSIS seperti yang muncul di teks asli.

Kategori yang tersedia:
- "strong"   : argumen/bukti yang baik
- "weak"     : klaim tanpa bukti atau terlalu umum
- "missing"  : seharusnya ada tapi tidak ada (tulis di reason saja, quote = null)

Return HANYA JSON, tanpa teks lain:
{
  "highlights": [
    {
      "quote": "kutipan teks persis dari esai",
      "category": "strong" | "weak",
      "reason": "penjelasan singkat dalam Bahasa Indonesia"
    }
  ]
}

Esai:
\"\"\"
{essay_text}
\"\"\"
"""
```

---

### 2. Backend — parse & match spans

```python
import re, json
import google.generativeai as genai

def extract_highlights(essay_text: str) -> list[dict]:
    model = genai.GenerativeModel("gemini-3-1-flash-lite")  # model yang sudah kamu pakai

    response = model.generate_content(
        HIGHLIGHT_PROMPT.format(essay_text=essay_text),
        generation_config={"response_mime_type": "application/json"}
    )

    data = json.loads(response.text)
    highlights = []

    for item in data.get("highlights", []):
        quote = item.get("quote")
        if not quote:
            continue

        # Cari posisi quote di teks asli (case-insensitive, toleran whitespace)
        pattern = re.escape(quote[:30])  # 30 char pertama sudah cukup unik
        match = re.search(pattern, essay_text, re.IGNORECASE)

        if match:
            start = match.start()
            # Gunakan panjang quote asli, bukan match
            end = start + len(quote)
            highlights.append({
                "start": start,
                "end": end,
                "quote": essay_text[start:end],  # ambil dari teks asli
                "category": item["category"],
                "reason": item["reason"]
            })

    # Sort by position agar tidak overlap
    highlights.sort(key=lambda x: x["start"])
    return remove_overlaps(highlights)

def remove_overlaps(spans: list[dict]) -> list[dict]:
    result = []
    last_end = 0
    for span in spans:
        if span["start"] >= last_end:
            result.append(span)
            last_end = span["end"]
    return result
```

---

### 3. API endpoint

```python
# FastAPI / Flask
@app.post("/api/highlights")
async def get_highlights(payload: dict):
    essay_text = payload["essay_text"]
    highlights = extract_highlights(essay_text)
    return {"highlights": highlights}
```

---

### 4. Frontend — render highlight

```javascript
function renderHighlightedEssay(essayText, highlights) {
    if (!highlights.length) return escapeHtml(essayText);

    let result = "";
    let cursor = 0;

    for (const h of highlights) {
        // Teks sebelum highlight
        result += escapeHtml(essayText.slice(cursor, h.start));

        // Teks yang di-highlight
        result += `<mark 
      class="hl hl-${h.category}" 
      data-reason="${escapeAttr(h.reason)}"
    >${escapeHtml(essayText.slice(h.start, h.end))}</mark>`;

        cursor = h.end;
    }

    // Sisa teks setelah highlight terakhir
    result += escapeHtml(essayText.slice(cursor));
    return result;
}

// Pasang tooltip on hover
document.querySelectorAll(".hl").forEach((el) => {
    el.addEventListener("mouseenter", (e) => showTooltip(e.target.dataset.reason));
    el.addEventListener("mouseleave", hideTooltip);
});
```

### Catatan penting

Karena kamu sudah pakai Gemini Flash-Lite untuk generate feedback mahasiswa, **gabungkan dua call jadi satu** — minta model return feedback + highlights sekaligus dalam satu JSON response. Ini hemat satu API call per esai.

```python
# Schema response gabungan
{
  "score": 78,
  "feedback": "...",          # sudah kamu implementasi
  "aspects": {...},           # sudah kamu implementasi
  "highlights": [...]         # tambahan baru
}
```
