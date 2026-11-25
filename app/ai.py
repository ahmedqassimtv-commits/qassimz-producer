"""QASSIMZ Producer — AI assistant.

Providers:
  github     GitHub Models (free with a GitHub token that has models:read) — OpenAI-compatible
  anthropic  Claude API (API key)
  openai     any OpenAI-compatible endpoint: Ollama / LM Studio (local), OpenRouter, OpenAI …
"""
from __future__ import annotations

import base64
import json
import re
import ssl
import urllib.error
import urllib.request
from pathlib import Path

PROVIDERS = {
    "github": {"name": "GitHub Models (مجاني)", "url": "https://models.github.ai/inference/chat/completions",
               "default_model": "openai/gpt-4.1", "models": ["openai/gpt-4.1", "openai/gpt-4.1-mini", "openai/gpt-4o",
                                                              "deepseek/DeepSeek-V3-0324", "meta/Llama-4-Maverick-17B-128E-Instruct-FP8"]},
    "anthropic": {"name": "Claude (Anthropic)", "url": "https://api.anthropic.com/v1/messages",
                  "default_model": "claude-sonnet-5-5", "models": ["claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5"]},
    "openai": {"name": "OpenAI-compatible / Ollama", "url": "http://localhost:11434/v1/chat/completions",
               "default_model": "qwen2.5:7b", "models": []},
}

SYSTEM = """أنت مساعد إنتاج محتوى لقناة يوتيوب عربية اسمها «قاسمز» (QASSIMZ) لصاحبها أحمد قاسم.
القناة بتقدم محتوى تعليمي/تفسيري ممتع بأسلوب الحكي زي «الدحيح»: هوك قوي، معلومة مبسطة، قصص، كوميديا خفيفة، ومصادر موثوقة.
اكتب دايماً بالعامية المصرية إلا لو اتطلب غير كده. خليك عملي ومختصر ومنظم."""


class AIError(Exception):
    pass


def _ctx():
    try:
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def _post(url, headers, body, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"Content-Type": "application/json", **headers})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_ctx() if url.startswith("https") else None) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:400]
        if e.code in (401, 403):
            raise AIError("المفتاح/التوكن غلط أو ملوش صلاحية. راجع إعدادات الذكاء الاصطناعي.") from None
        if e.code == 429:
            raise AIError("وصلت لحد الاستخدام دلوقتي — استنى شوية أو غيّر الموديل.") from None
        raise AIError(f"خطأ من الخدمة ({e.code}): {detail}") from None
    except urllib.error.URLError as e:
        raise AIError(f"مقدرتش أوصل للخدمة: {e.reason}") from None


class AI:
    def __init__(self, settings: dict):
        self.provider = settings.get("ai_provider") or "github"
        p = PROVIDERS.get(self.provider, PROVIDERS["github"])
        self.key = (settings.get(f"ai_key_{self.provider}") or "").strip()
        self.model = (settings.get("ai_model") or "").strip() or p["default_model"]
        self.url = (settings.get("ai_url") or "").strip() if self.provider == "openai" and settings.get("ai_url") else p["url"]

    def ready(self) -> bool:
        return bool(self.key) or self.provider == "openai"

    # ------------------------------------------------------------------ core call
    def chat(self, messages: list, system: str = SYSTEM, max_tokens: int = 3000, image: str | None = None) -> str:
        if not self.ready():
            raise AIError("لازم تحط المفتاح/التوكن الأول من ⚙ الإعدادات ← الذكاء الاصطناعي.")
        msgs = [dict(m) for m in messages]
        if image:  # attach to the last user message
            data = base64.b64encode(Path(image).read_bytes()).decode()
            mt = "image/png" if image.lower().endswith(".png") else "image/jpeg"
            last = msgs[-1]["content"]
            if self.provider == "anthropic":
                msgs[-1]["content"] = [{"type": "image", "source": {"type": "base64", "media_type": mt, "data": data}},
                                       {"type": "text", "text": last}]
            else:
                msgs[-1]["content"] = [{"type": "text", "text": last},
                                       {"type": "image_url", "image_url": {"url": f"data:{mt};base64,{data}"}}]
        if self.provider == "anthropic":
            r = _post(self.url, {"x-api-key": self.key, "anthropic-version": "2023-06-01"},
                      {"model": self.model, "max_tokens": max_tokens, "system": system, "messages": msgs})
            return "".join(b.get("text", "") for b in r.get("content", []) if b.get("type") == "text").strip()
        headers = {"Authorization": f"Bearer {self.key}"} if self.key else {}
        r = _post(self.url, headers, {"model": self.model, "max_tokens": max_tokens,
                                      "messages": [{"role": "system", "content": system}] + msgs})
        try:
            return (r["choices"][0]["message"]["content"] or "").strip()
        except Exception:
            raise AIError("رد غير متوقع من الخدمة.") from None

    def ask(self, prompt: str, **kw) -> str:
        return self.chat([{"role": "user", "content": prompt}], **kw)

    def ask_json(self, prompt: str, **kw):
        text = self.ask(prompt + "\n\nرجّع JSON صالح فقط بدون أي شرح وبدون ```.", **kw)
        return parse_json(text)


def parse_json(text: str):
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t, flags=re.S)
    try:
        return json.loads(t)
    except Exception:
        m = re.search(r"(\{.*\}|\[.*\])", t, re.S)
        if m:
            return json.loads(m.group(1))
        raise AIError("الذكاء الاصطناعي رجّع رد مش مفهوم — جرّب تاني.")


# ====================================================================== actions
def episode_context(e: dict, full=True) -> str:
    parts = [f"عنوان الحلقة: {e['title']}"]
    if e.get("series"):
        parts.append(f"السلسلة: {e['series']['name']} — {e['series'].get('description') or ''}")
    if e.get("hook"):
        parts.append(f"الهوك: {e['hook']}")
    if e.get("notes"):
        parts.append(f"ملاحظات: {e['notes'][:2000]}")
    if full and e.get("scenes"):
        parts.append("السكريبت الحالي:")
        for i, s in enumerate(e["scenes"], 1):
            parts.append(f"[{i}] {s['heading']}\n{s['text'][:3000]}\nمرئي: {s['visual']} | صوت: {s['audio']}")
    if e.get("sources"):
        parts.append("المصادر: " + "; ".join(f"{s['title']} {s['url']}" for s in e["sources"]))
    return "\n".join(parts)


def ideas(ai: AI, topic: str, series: dict | None, existing: list, n=6):
    ctx = f"السلسلة: {series['name']} — {series.get('description') or ''}\n" if series else ""
    ex = "\n".join(f"- {t}" for t in existing[:40])
    return ai.ask_json(f"""{ctx}الموضوع/الاتجاه: {topic}
حلقات موجودة (ماتكررهاش):
{ex or '- مفيش'}

اقترح {n} أفكار حلقات جديدة. لكل فكرة:
{{"title": "عنوان جذاب", "hook": "أول جملة في الفيديو تشد المشاهد", "angle": "الزاوية/ليه هتنجح في سطرين", "research": ["نقطة بحث 1","نقطة بحث 2","نقطة بحث 3"]}}
رجّع: {{"ideas": [ ... ]}}""")


def outline(ai: AI, e: dict, minutes: float = 10):
    return ai.ask_json(f"""{episode_context(e, full=False)}

اكتب هيكل سكريبت لحلقة مدتها حوالي {minutes} دقيقة بأسلوب الحكي (هوك ← المشكلة ← القصة/الشرح ← المفاجأة ← الخلاصة ← دعوة للتفاعل).
قسّمها لمشاهد. لكل مشهد:
{{"heading": "اسم المشهد", "text": "نص الكلام بالعامية المصرية (مسودة كاملة قابلة للقراءة)", "visual": "اقتراح المرئي/B-roll/جرافيك", "audio": "مود الموسيقى أو مؤثر صوتي"}}
رجّع: {{"hook": "...", "scenes": [ ... ]}}""", max_tokens=6000)


REWRITE = {
    "shorter": "اختصر النص ده للنص تقريباً من غير ما تضيّع المعلومة.",
    "longer": "طوّل النص ده بأمثلة وتفاصيل ممتعة.",
    "egyptian": "حوّل النص ده لعامية مصرية طبيعية وسلسة كأنه بيتقال قدام الكاميرا.",
    "funny": "ضيف لمسة كوميدية خفيفة ذكية للنص ده بأسلوب الدحيح من غير ما تبوّظ المعلومة.",
    "simple": "بسّط النص ده جداً لدرجة إن طفل عنده 12 سنة يفهمه.",
    "hook": "اكتب 5 هوكات قوية مختلفة ممكن تبدأ بيها المشهد ده، كل واحد في سطر.",
    "fix": "صحّح الأخطاء الإملائية والنحوية ونسّق النص من غير ما تغيّر الأسلوب.",
}


def rewrite(ai: AI, text: str, mode: str, e: dict | None = None):
    inst = REWRITE.get(mode, mode)
    ctx = f"سياق الحلقة: {e['title']}\n" if e else ""
    return ai.ask(f"{ctx}{inst}\nرجّع النص الجديد بس.\n\nالنص:\n{text}")


def scene_suggest(ai: AI, e: dict, scene: dict, library: list):
    lib = "\n".join(f"#{a['id']} [{a['kind']}] {a['name']} — {a['tags']}" for a in library[:300])
    return ai.ask_json(f"""الحلقة: {e['title']}
المشهد: {scene['heading']}
النص: {scene['text'][:3000]}

ملفات المكتبة المتاحة (id، النوع، الاسم، التاجات):
{lib or 'المكتبة فاضية'}

اقترح للمشهد ده:
{{"visual": "وصف المرئي/B-roll/جرافيك المقترح", "audio": "مود الموسيقى والمؤثرات", "search": ["كلمات بحث إنجليزي لـ stock footage"], "assets": [ids من المكتبة تناسب المشهد لو فيه]}}""")


def tasks(ai: AI, e: dict):
    return ai.ask_json(f"""{episode_context(e)}

طلّع قايمة مهام إنتاج عملية ومحددة للحلقة دي (بحث، تصوير، جرافيك، موسيقى، مونتاج، ثمبنيل، نشر) — من 6 لـ 14 مهمة.
رجّع: {{"tasks": ["مهمة 1", "مهمة 2"]}}""")


def publish(ai: AI, e: dict):
    return ai.ask_json(f"""{episode_context(e)}

جهّز باكدج النشر على يوتيوب:
{{"titles": ["5 عناوين جذابة مختلفة"], "description": "وصف كامل بالعامية فيه ملخص + فهرس زمني تقريبي (00:00 ...) + مكان للمصادر",
  "tags": ["15 تاج عربي وإنجليزي"], "thumbnail": ["4 أفكار ثمبنيل: النص اللي عليها + الصورة/التعبير"], "shorts": ["3 أفكار شورتس من الحلقة"]}}""", max_tokens=4000)


def research(ai: AI, e: dict, text: str):
    return ai.ask(f"""الحلقة: {e['title']}
لخّص المصدر ده في نقاط مفيدة للسكريبت (حقايق، أرقام، قصص، اقتباسات قصيرة)، وقول إيه اللي محتاج تأكيد من مصدر تاني.

المصدر:
{text[:20000]}""")


def tag_asset(ai: AI, asset: dict, thumb: str | None):
    prompt = f"""ملف في مكتبة مونتاج: الاسم "{asset['name']}"، النوع {asset['kind']}.
اقترح 6-10 تاجات قصيرة (عربي وإنجليزي) تساعد في البحث عنه، ووصف في سطر.
رجّع: {{"tags": ["..."], "note": "..."}}"""
    return parse_json(ai.ask(prompt + "\nرجّع JSON فقط.", image=thumb, max_tokens=600))


def organize_board(ai: AI, notes: list):
    txt = "\n".join(f"#{n['id']}: {n['text']}" for n in notes if (n.get("text") or "").strip())
    return ai.ask_json(f"""دي أفكار مكتوبة على لوحة الأفكار (id: النص):
{txt}

جمّعها في مجموعات منطقية، وكل مجموعة ممكن تبقى حلقة أو سلسلة.
رجّع: {{"groups": [{{"title": "اسم المجموعة/الحلقة المقترحة", "ids": [ids], "why": "سطر"}}]}}""")
