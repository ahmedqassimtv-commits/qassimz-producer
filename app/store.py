"""QASSIMZ Producer — data store (SQLite) + all project operations."""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import mimetypes
import os
import re
import shutil
import sqlite3
import subprocess
import threading
from pathlib import Path

try:
    from PIL import Image  # type: ignore
except Exception:  # pragma: no cover
    Image = None

STAGES = ["idea", "research", "script", "record", "edit", "ready", "published"]
STAGE_AR = {"idea": "فكرة", "research": "بحث", "script": "سكريبت", "record": "تسجيل",
            "edit": "مونتاج", "ready": "جاهز", "published": "منشور"}

KINDS = {
    "image": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".heic", ".avif", ".tif", ".tiff", ".svg", ".jfif"},
    "video": {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v", ".wmv", ".mts"},
    "music": {".mp3", ".wav", ".flac", ".aac", ".m4a", ".ogg", ".opus", ".wma", ".aiff"},
    "graphic": {".psd", ".ai", ".eps", ".mogrt", ".aep", ".prproj", ".xd", ".fig", ".afdesign", ".lottie", ".json"},
    "doc": {".pdf", ".doc", ".docx", ".txt", ".md", ".rtf", ".pptx", ".xlsx", ".csv"},
    "font": {".ttf", ".otf", ".woff", ".woff2"},
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS series(id INTEGER PRIMARY KEY, name TEXT, color TEXT, description TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS episodes(id INTEGER PRIMARY KEY, series_id INTEGER, title TEXT, stage TEXT DEFAULT 'idea',
  publish_date TEXT, hook TEXT DEFAULT '', notes TEXT DEFAULT '', pos REAL DEFAULT 0, meta TEXT DEFAULT '{}',
  created TEXT, updated TEXT);
CREATE TABLE IF NOT EXISTS scenes(id INTEGER PRIMARY KEY, episode_id INTEGER, pos REAL, heading TEXT DEFAULT '',
  text TEXT DEFAULT '', visual TEXT DEFAULT '', audio TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, episode_id INTEGER, text TEXT, done INTEGER DEFAULT 0, pos REAL, due TEXT);
CREATE TABLE IF NOT EXISTS sources(id INTEGER PRIMARY KEY, episode_id INTEGER, title TEXT, url TEXT, note TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS assets(id INTEGER PRIMARY KEY, path TEXT UNIQUE, name TEXT, kind TEXT, size INTEGER,
  tags TEXT DEFAULT '', note TEXT DEFAULT '', added TEXT, w INTEGER, h INTEGER, duration REAL);
CREATE TABLE IF NOT EXISTS asset_links(asset_id INTEGER, episode_id INTEGER, scene_id INTEGER DEFAULT 0,
  PRIMARY KEY(asset_id, episode_id, scene_id));
CREATE TABLE IF NOT EXISTS board(id INTEGER PRIMARY KEY, type TEXT, x REAL, y REAL, w REAL, h REAL, text TEXT DEFAULT '',
  color TEXT DEFAULT 'violet', asset_id INTEGER, url TEXT, episode_id INTEGER, created TEXT);
CREATE TABLE IF NOT EXISTS board_links(id INTEGER PRIMARY KEY, a INTEGER, b INTEGER);
CREATE TABLE IF NOT EXISTS chat(id INTEGER PRIMARY KEY, episode_id INTEGER, role TEXT, content TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY, v TEXT);
"""


def now() -> str:
    return dt.datetime.now().isoformat(timespec="seconds")


def kind_of(path: str) -> str:
    ext = Path(path).suffix.lower()
    for k, s in KINDS.items():
        if ext in s:
            return k
    return "other"


def words(text: str) -> int:
    return len(re.findall(r"\S+", text or ""))


class Store:
    def __init__(self, data_dir: Path):
        self.dir = Path(data_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self.thumbs = self.dir / "thumbs"
        self.thumbs.mkdir(exist_ok=True)
        self.lock = threading.RLock()
        self.db = sqlite3.connect(self.dir / "producer.db", check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.commit()

    # ------------------------------------------------------------------ helpers
    def q(self, sql, args=()):
        with self.lock:
            return [dict(r) for r in self.db.execute(sql, args).fetchall()]

    def one(self, sql, args=()):
        r = self.q(sql, args)
        return r[0] if r else None

    def x(self, sql, args=()):
        with self.lock:
            cur = self.db.execute(sql, args)
            self.db.commit()
            return cur.lastrowid

    # ------------------------------------------------------------------ settings
    def get_setting(self, k, default=None):
        r = self.one("SELECT v FROM settings WHERE k=?", (k,))
        if not r:
            return default
        try:
            return json.loads(r["v"])
        except Exception:
            return r["v"]

    def set_setting(self, k, v):
        self.x("INSERT INTO settings(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v", (k, json.dumps(v, ensure_ascii=False)))

    def settings(self):
        out = {r["k"]: json.loads(r["v"]) for r in self.q("SELECT k,v FROM settings")}
        out.setdefault("wpm", 140)
        out.setdefault("library_dir", str(Path.home() / "Documents" / "QASSIMZ Producer" / "Library"))
        out.setdefault("copy_into_library", True)
        out.setdefault("ai_provider", "github")
        out.setdefault("ai_model", "")
        out.setdefault("auto_update", True)
        return out

    # ------------------------------------------------------------------ series
    def series_list(self):
        rows = self.q("SELECT * FROM series ORDER BY id")
        for s in rows:
            s["count"] = self.one("SELECT COUNT(*) c FROM episodes WHERE series_id=?", (s["id"],))["c"]
            s["published"] = self.one("SELECT COUNT(*) c FROM episodes WHERE series_id=? AND stage='published'", (s["id"],))["c"]
        return rows

    def series_save(self, s: dict):
        if s.get("id"):
            self.x("UPDATE series SET name=?, color=?, description=? WHERE id=?",
                   (s.get("name", ""), s.get("color", "violet"), s.get("description", ""), s["id"]))
            return s["id"]
        return self.x("INSERT INTO series(name,color,description,created) VALUES(?,?,?,?)",
                      (s.get("name", "سلسلة جديدة"), s.get("color", "violet"), s.get("description", ""), now()))

    def series_delete(self, sid):
        self.x("UPDATE episodes SET series_id=NULL WHERE series_id=?", (sid,))
        self.x("DELETE FROM series WHERE id=?", (sid,))

    # ------------------------------------------------------------------ episodes
    def _ep_summary(self, e, wpm):
        e["meta"] = json.loads(e.get("meta") or "{}")
        sc = self.q("SELECT text FROM scenes WHERE episode_id=?", (e["id"],))
        w = sum(words(s["text"]) for s in sc)
        e["words"] = w
        e["minutes"] = round(w / max(60, wpm), 1)
        t = self.one("SELECT COUNT(*) n, SUM(done) d FROM tasks WHERE episode_id=?", (e["id"],))
        e["tasks"] = t["n"] or 0
        e["tasks_done"] = t["d"] or 0
        e["assets"] = self.one("SELECT COUNT(DISTINCT asset_id) c FROM asset_links WHERE episode_id=?", (e["id"],))["c"]
        return e

    def episodes(self, series_id=None):
        wpm = self.settings()["wpm"]
        if series_id:
            rows = self.q("SELECT * FROM episodes WHERE series_id=? ORDER BY pos, id", (series_id,))
        else:
            rows = self.q("SELECT * FROM episodes ORDER BY pos, id")
        return [self._ep_summary(e, wpm) for e in rows]

    def episode(self, eid):
        e = self.one("SELECT * FROM episodes WHERE id=?", (eid,))
        if not e:
            return None
        e = self._ep_summary(e, self.settings()["wpm"])
        e["scenes"] = self.q("SELECT * FROM scenes WHERE episode_id=? ORDER BY pos, id", (eid,))
        for s in e["scenes"]:
            s["assets"] = self.q("SELECT a.* FROM assets a JOIN asset_links l ON l.asset_id=a.id WHERE l.episode_id=? AND l.scene_id=?",
                                 (eid, s["id"]))
        e["tasks_list"] = self.q("SELECT * FROM tasks WHERE episode_id=? ORDER BY done, pos, id", (eid,))
        e["sources"] = self.q("SELECT * FROM sources WHERE episode_id=? ORDER BY id", (eid,))
        e["bin"] = self.q("SELECT DISTINCT a.* FROM assets a JOIN asset_links l ON l.asset_id=a.id WHERE l.episode_id=? ORDER BY a.kind, a.name", (eid,))
        e["series"] = self.one("SELECT * FROM series WHERE id=?", (e["series_id"],)) if e["series_id"] else None
        return e

    def episode_create(self, d: dict):
        pos = (self.one("SELECT MAX(pos) m FROM episodes")["m"] or 0) + 1
        eid = self.x("INSERT INTO episodes(series_id,title,stage,publish_date,hook,notes,pos,meta,created,updated) VALUES(?,?,?,?,?,?,?,?,?,?)",
                     (d.get("series_id"), d.get("title") or "حلقة جديدة", d.get("stage", "idea"), d.get("publish_date"),
                      d.get("hook", ""), d.get("notes", ""), pos, json.dumps(d.get("meta", {}), ensure_ascii=False), now(), now()))
        for i, sc in enumerate(d.get("scenes") or []):
            self.scene_save({"episode_id": eid, "pos": i, **sc})
        return eid

    def episode_update(self, eid, fields: dict):
        allowed = {"series_id", "title", "stage", "publish_date", "hook", "notes", "pos"}
        sets, args = [], []
        for k, v in fields.items():
            if k in allowed:
                sets.append(f"{k}=?")
                args.append(v)
        if "meta" in fields:
            cur = json.loads(self.one("SELECT meta FROM episodes WHERE id=?", (eid,))["meta"] or "{}")
            cur.update(fields["meta"] or {})
            sets.append("meta=?")
            args.append(json.dumps(cur, ensure_ascii=False))
        if sets:
            sets.append("updated=?")
            args.append(now())
            self.x(f"UPDATE episodes SET {', '.join(sets)} WHERE id=?", (*args, eid))
        return True

    def episode_move(self, eid, stage, before_id=None):
        if before_id:
            b = self.one("SELECT pos FROM episodes WHERE id=?", (before_id,))
            prev = self.one("SELECT MAX(pos) m FROM episodes WHERE stage=? AND pos<? AND id<>?", (stage, b["pos"], eid))
            pos = ((prev["m"] if prev and prev["m"] is not None else b["pos"] - 1) + b["pos"]) / 2
        else:
            pos = (self.one("SELECT MAX(pos) m FROM episodes")["m"] or 0) + 1
        self.x("UPDATE episodes SET stage=?, pos=?, updated=? WHERE id=?", (stage, pos, now(), eid))
        return True

    def episode_delete(self, eid):
        for t in ("scenes", "tasks", "sources", "asset_links", "chat"):
            self.x(f"DELETE FROM {t} WHERE episode_id=?", (eid,))
        self.x("UPDATE board SET episode_id=NULL WHERE episode_id=?", (eid,))
        self.x("DELETE FROM episodes WHERE id=?", (eid,))

    def episode_duplicate(self, eid):
        e = self.episode(eid)
        nid = self.episode_create({"series_id": e["series_id"], "title": e["title"] + " (نسخة)", "stage": "idea",
                                   "hook": e["hook"], "notes": e["notes"], "meta": e["meta"],
                                   "scenes": [{k: s[k] for k in ("heading", "text", "visual", "audio")} for s in e["scenes"]]})
        for t in e["tasks_list"]:
            self.task_save({"episode_id": nid, "text": t["text"]})
        return nid

    # ------------------------------------------------------------------ scenes
    def scene_save(self, s: dict):
        if s.get("id"):
            f = {k: s[k] for k in ("heading", "text", "visual", "audio", "pos") if k in s}
            if f:
                self.x(f"UPDATE scenes SET {', '.join(k + '=?' for k in f)} WHERE id=?", (*f.values(), s["id"]))
                self.x("UPDATE episodes SET updated=? WHERE id=(SELECT episode_id FROM scenes WHERE id=?)", (now(), s["id"]))
            return s["id"]
        pos = s.get("pos")
        if pos is None:
            pos = (self.one("SELECT MAX(pos) m FROM scenes WHERE episode_id=?", (s["episode_id"],))["m"] or 0) + 1
        return self.x("INSERT INTO scenes(episode_id,pos,heading,text,visual,audio) VALUES(?,?,?,?,?,?)",
                      (s["episode_id"], pos, s.get("heading", ""), s.get("text", ""), s.get("visual", ""), s.get("audio", "")))

    def scene_delete(self, sid):
        self.x("DELETE FROM asset_links WHERE scene_id=?", (sid,))
        self.x("DELETE FROM scenes WHERE id=?", (sid,))

    def scenes_reorder(self, ids: list):
        for i, sid in enumerate(ids):
            self.x("UPDATE scenes SET pos=? WHERE id=?", (i, sid))
        return True

    # ------------------------------------------------------------------ tasks & sources
    def task_save(self, t: dict):
        if t.get("id"):
            f = {k: t[k] for k in ("text", "done", "due") if k in t}
            self.x(f"UPDATE tasks SET {', '.join(k + '=?' for k in f)} WHERE id=?", (*f.values(), t["id"]))
            return t["id"]
        pos = (self.one("SELECT MAX(pos) m FROM tasks WHERE episode_id=?", (t["episode_id"],))["m"] or 0) + 1
        return self.x("INSERT INTO tasks(episode_id,text,done,pos,due) VALUES(?,?,?,?,?)",
                      (t["episode_id"], t.get("text", ""), int(t.get("done", 0)), pos, t.get("due")))

    def task_delete(self, tid):
        self.x("DELETE FROM tasks WHERE id=?", (tid,))

    def all_tasks(self):
        return self.q("SELECT t.*, e.title episode_title FROM tasks t JOIN episodes e ON e.id=t.episode_id WHERE t.done=0 AND e.stage<>'published' ORDER BY t.due IS NULL, t.due, e.publish_date")

    def source_save(self, s: dict):
        if s.get("id"):
            self.x("UPDATE sources SET title=?, url=?, note=? WHERE id=?", (s.get("title", ""), s.get("url", ""), s.get("note", ""), s["id"]))
            return s["id"]
        return self.x("INSERT INTO sources(episode_id,title,url,note) VALUES(?,?,?,?)",
                      (s["episode_id"], s.get("title", ""), s.get("url", ""), s.get("note", "")))

    def source_delete(self, sid):
        self.x("DELETE FROM sources WHERE id=?", (sid,))

    # ------------------------------------------------------------------ library
    def library_dir(self) -> Path:
        p = Path(self.settings()["library_dir"])
        p.mkdir(parents=True, exist_ok=True)
        return p

    def import_files(self, paths: list, episode_id=None, scene_id=0, copy=None):
        if copy is None:
            copy = bool(self.settings()["copy_into_library"])
        lib = self.library_dir()
        ids = []
        for p in paths:
            src = Path(p)
            if src.is_dir():
                ids += self.import_files([str(f) for f in src.rglob("*") if f.is_file()], episode_id, scene_id, copy)
                continue
            if not src.is_file():
                continue
            k = kind_of(str(src))
            dst = src
            if copy and lib not in src.parents:
                folder = lib / {"image": "صور", "video": "فيديو", "music": "موسيقى وصوت", "graphic": "جرافيك",
                                "doc": "مستندات", "font": "خطوط"}.get(k, "أخرى")
                folder.mkdir(parents=True, exist_ok=True)
                dst = folder / src.name
                n = 2
                while dst.exists() and not self._same(src, dst):
                    dst = folder / f"{src.stem} ({n}){src.suffix}"
                    n += 1
                if not dst.exists():
                    shutil.copy2(src, dst)
            ex = self.one("SELECT id FROM assets WHERE path=?", (str(dst),))
            if ex:
                aid = ex["id"]
            else:
                w = h = dur = None
                if k == "image" and Image is not None:
                    try:
                        with Image.open(dst) as im:
                            w, h = im.size
                    except Exception:
                        pass
                aid = self.x("INSERT INTO assets(path,name,kind,size,tags,note,added,w,h,duration) VALUES(?,?,?,?,?,?,?,?,?,?)",
                             (str(dst), dst.name, k, dst.stat().st_size, self._auto_tags(dst, k), "", now(), w, h, dur))
            ids.append(aid)
            if episode_id:
                self.link(aid, episode_id, scene_id)
        return ids

    @staticmethod
    def _same(a: Path, b: Path) -> bool:
        try:
            return a.stat().st_size == b.stat().st_size
        except OSError:
            return False

    @staticmethod
    def _auto_tags(p: Path, k: str) -> str:
        base = re.sub(r"[_\-\.]+", " ", p.stem)
        base = re.sub(r"\d{3,}", " ", base)
        tags = [t for t in base.lower().split() if len(t) > 2][:6]
        return ", ".join(tags)

    def assets(self, kind=None, q=None, episode_id=None):
        sql = "SELECT a.*, (SELECT COUNT(DISTINCT episode_id) FROM asset_links l WHERE l.asset_id=a.id) uses FROM assets a"
        cond, args = [], []
        if kind and kind != "all":
            cond.append("a.kind=?")
            args.append(kind)
        if q:
            cond.append("(a.name LIKE ? OR a.tags LIKE ? OR a.note LIKE ?)")
            args += [f"%{q}%"] * 3
        if episode_id:
            cond.append("a.id IN (SELECT asset_id FROM asset_links WHERE episode_id=?)")
            args.append(episode_id)
        if cond:
            sql += " WHERE " + " AND ".join(cond)
        sql += " ORDER BY a.added DESC"
        rows = self.q(sql, args)
        for r in rows:
            r["exists"] = os.path.exists(r["path"])
        return rows

    def asset(self, aid):
        a = self.one("SELECT * FROM assets WHERE id=?", (aid,))
        if a:
            a["episodes"] = self.q("SELECT DISTINCT e.id, e.title FROM episodes e JOIN asset_links l ON l.episode_id=e.id WHERE l.asset_id=?", (aid,))
        return a

    def asset_update(self, aid, fields):
        f = {k: fields[k] for k in ("tags", "note", "name") if k in fields}
        if f:
            self.x(f"UPDATE assets SET {', '.join(k + '=?' for k in f)} WHERE id=?", (*f.values(), aid))
        return True

    def asset_delete(self, aid, delete_file=False):
        a = self.one("SELECT * FROM assets WHERE id=?", (aid,))
        self.x("DELETE FROM asset_links WHERE asset_id=?", (aid,))
        self.x("DELETE FROM assets WHERE id=?", (aid,))
        if a and delete_file and self.library_dir() in Path(a["path"]).parents:
            try:
                Path(a["path"]).unlink()
            except OSError:
                pass

    def link(self, aid, eid, scene_id=0):
        self.x("INSERT OR IGNORE INTO asset_links(asset_id,episode_id,scene_id) VALUES(?,?,?)", (aid, eid, scene_id or 0))
        if scene_id:  # also in the episode bin
            self.x("INSERT OR IGNORE INTO asset_links(asset_id,episode_id,scene_id) VALUES(?,?,0)", (aid, eid))
        return True

    def unlink(self, aid, eid, scene_id=0):
        if scene_id:
            self.x("DELETE FROM asset_links WHERE asset_id=? AND episode_id=? AND scene_id=?", (aid, eid, scene_id))
        else:
            self.x("DELETE FROM asset_links WHERE asset_id=? AND episode_id=?", (aid, eid))
        return True

    def thumb(self, aid, size=320) -> Path | None:
        a = self.one("SELECT path, kind FROM assets WHERE id=?", (aid,))
        if not a or not os.path.exists(a["path"]):
            return None
        st = os.stat(a["path"])
        key = hashlib.sha1(f"{a['path']}|{st.st_mtime}|{size}".encode()).hexdigest()
        out = self.thumbs / f"{key}.jpg"
        if out.exists():
            return out
        try:
            if a["kind"] == "image" and Image is not None and not a["path"].lower().endswith(".svg"):
                with Image.open(a["path"]) as im:
                    im.thumbnail((size, size))
                    im.convert("RGB").save(out, "JPEG", quality=82)
                return out
            if a["kind"] == "video" and shutil.which("ffmpeg"):
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", "1", "-i", a["path"], "-frames:v", "1",
                                "-vf", f"scale={size}:-2", str(out)], timeout=20,
                               creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                return out if out.exists() else None
        except Exception:
            return None
        return None

    # ------------------------------------------------------------------ idea board
    def board(self):
        items = self.q("SELECT b.*, a.name asset_name, a.kind asset_kind, e.title episode_title, e.stage episode_stage "
                       "FROM board b LEFT JOIN assets a ON a.id=b.asset_id LEFT JOIN episodes e ON e.id=b.episode_id")
        links = self.q("SELECT * FROM board_links")
        return {"items": items, "links": links}

    def board_save(self, it: dict):
        if it.get("id"):
            f = {k: it[k] for k in ("x", "y", "w", "h", "text", "color", "url", "episode_id", "asset_id") if k in it}
            if f:
                self.x(f"UPDATE board SET {', '.join(k + '=?' for k in f)} WHERE id=?", (*f.values(), it["id"]))
            return it["id"]
        return self.x("INSERT INTO board(type,x,y,w,h,text,color,asset_id,url,episode_id,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                      (it.get("type", "note"), it.get("x", 0), it.get("y", 0), it.get("w", 220), it.get("h", 150),
                       it.get("text", ""), it.get("color", "violet"), it.get("asset_id"), it.get("url"), it.get("episode_id"), now()))

    def board_delete(self, bid):
        self.x("DELETE FROM board_links WHERE a=? OR b=?", (bid, bid))
        self.x("DELETE FROM board WHERE id=?", (bid,))

    def board_link(self, a, b):
        if a == b or self.one("SELECT id FROM board_links WHERE (a=? AND b=?) OR (a=? AND b=?)", (a, b, b, a)):
            return None
        return self.x("INSERT INTO board_links(a,b) VALUES(?,?)", (a, b))

    def board_unlink(self, lid):
        self.x("DELETE FROM board_links WHERE id=?", (lid,))

    # ------------------------------------------------------------------ dashboard
    def dashboard(self):
        eps = self.episodes()
        today = dt.date.today().isoformat()
        by_stage = {s: 0 for s in STAGES}
        for e in eps:
            by_stage[e["stage"]] = by_stage.get(e["stage"], 0) + 1
        upcoming = sorted([e for e in eps if e.get("publish_date") and e["publish_date"] >= today and e["stage"] != "published"],
                          key=lambda e: e["publish_date"])[:6]
        recent = sorted(eps, key=lambda e: e.get("updated") or "", reverse=True)[:6]
        return {"by_stage": by_stage, "upcoming": upcoming, "recent": recent, "series": self.series_list(),
                "tasks": self.all_tasks()[:8], "assets": self.one("SELECT COUNT(*) c FROM assets")["c"],
                "ideas": self.one("SELECT COUNT(*) c FROM board WHERE type='note'")["c"], "total": len(eps)}

    # ------------------------------------------------------------------ chat log
    def chat_log(self, eid):
        return self.q("SELECT * FROM chat WHERE COALESCE(episode_id,0)=? ORDER BY id", (eid or 0,))

    def chat_add(self, eid, role, content):
        return self.x("INSERT INTO chat(episode_id,role,content,created) VALUES(?,?,?,?)", (eid or 0, role, content, now()))

    def chat_clear(self, eid):
        self.x("DELETE FROM chat WHERE COALESCE(episode_id,0)=?", (eid or 0,))

    # ------------------------------------------------------------------ export
    def export_episode(self, eid, target_dir: str) -> str:
        e = self.episode(eid)
        safe = re.sub(r'[<>:"/\\|?*]', "", e["title"]).strip() or f"episode-{eid}"
        root = Path(target_dir) / safe
        root.mkdir(parents=True, exist_ok=True)
        folders = {"image": "02 صور", "video": "03 فيديو", "music": "04 موسيقى وصوت", "graphic": "05 جرافيك",
                   "doc": "06 مستندات", "font": "07 خطوط", "other": "08 أخرى"}
        copied = {}
        for a in e["bin"]:
            if not os.path.exists(a["path"]):
                continue
            d = root / folders.get(a["kind"], "08 أخرى")
            d.mkdir(exist_ok=True)
            dst = d / a["name"]
            if not dst.exists():
                shutil.copy2(a["path"], dst)
            copied[a["id"]] = str(dst.relative_to(root))
        (root / "01 سكريبت").mkdir(exist_ok=True)
        md = self.script_markdown(e, copied)
        (root / "01 سكريبت" / f"{safe}.md").write_text(md, encoding="utf-8")
        self._docx(e, root / "01 سكريبت" / f"{safe}.docx")
        # edit list for the editor
        lines = ["المشهد,العنوان,النص (أول 80 حرف),المرئي,الصوت,الملفات"]
        for i, s in enumerate(e["scenes"], 1):
            files = " | ".join(copied.get(a["id"], a["name"]) for a in s["assets"])
            row = [str(i), s["heading"], (s["text"] or "")[:80], s["visual"], s["audio"], files]
            lines.append(",".join('"' + (c or "").replace('"', '""').replace("\n", " ") + '"' for c in row))
        (root / "01 سكريبت" / "edit-list.csv").write_text("﻿" + "\n".join(lines), encoding="utf-8")
        return str(root)

    def script_markdown(self, e, copied=None):
        wpm = self.settings()["wpm"]
        out = [f"# {e['title']}", ""]
        if e.get("series"):
            out.append(f"**السلسلة:** {e['series']['name']}  ")
        out.append(f"**المدة التقريبية:** {e['minutes']} دقيقة · {e['words']} كلمة  ")
        if e.get("hook"):
            out += ["", f"> **الهوك:** {e['hook']}"]
        for i, s in enumerate(e["scenes"], 1):
            out += ["", f"## {i}. {s['heading'] or 'مشهد'}  _(~{round(words(s['text']) / wpm * 60)} ث)_", "", s["text"] or ""]
            if s["visual"]:
                out += ["", f"🎬 **المرئي:** {s['visual']}"]
            if s["audio"]:
                out += [f"🎵 **الصوت:** {s['audio']}"]
            if s["assets"]:
                out += ["📎 " + " · ".join((copied or {}).get(a["id"], a["name"]) for a in s["assets"])]
        if e["sources"]:
            out += ["", "## المصادر"] + [f"- [{s['title'] or s['url']}]({s['url']})" + (f" — {s['note']}" if s["note"] else "") for s in e["sources"]]
        return "\n".join(out) + "\n"

    def _docx(self, e, path: Path):
        try:
            from docx import Document  # type: ignore
            from docx.enum.text import WD_ALIGN_PARAGRAPH  # type: ignore
            from docx.oxml.ns import qn  # type: ignore
        except Exception:
            return
        doc = Document()
        st = doc.styles["Normal"]
        st.font.name = "Arial"
        st.element.rPr.rFonts.set(qn("w:cs"), "Arial")

        def rtl(p):
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            pPr = p._p.get_or_add_pPr()
            b = pPr.makeelement(qn("w:bidi"), {})
            pPr.append(b)
            return p

        rtl(doc.add_heading(e["title"], 0))
        rtl(doc.add_paragraph(f"المدة التقريبية: {e['minutes']} دقيقة · {e['words']} كلمة"))
        if e.get("hook"):
            rtl(doc.add_paragraph(f"الهوك: {e['hook']}"))
        for i, s in enumerate(e["scenes"], 1):
            rtl(doc.add_heading(f"{i}. {s['heading'] or 'مشهد'}", 1))
            for para in (s["text"] or "").split("\n"):
                rtl(doc.add_paragraph(para))
            if s["visual"]:
                rtl(doc.add_paragraph(f"🎬 المرئي: {s['visual']}"))
            if s["audio"]:
                rtl(doc.add_paragraph(f"🎵 الصوت: {s['audio']}"))
        doc.save(path)

    # ------------------------------------------------------------------ backup
    def backup(self, target: str) -> str:
        dst = Path(target) / f"QASSIMZ-Producer-backup-{dt.datetime.now():%Y%m%d-%H%M}.db"
        with self.lock:
            b = sqlite3.connect(dst)
            self.db.backup(b)
            b.close()
        return str(dst)
