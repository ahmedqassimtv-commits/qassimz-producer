"""QASSIMZ Producer — local API server (127.0.0.1 only, random token).

The UI (app/ui) is served from here and talks to /api/<method>.
Files and thumbnails are streamed from /file/<id> and /thumb/<id> (with Range support for audio/video).
"""
from __future__ import annotations

import json
import mimetypes
import os
import secrets
import subprocess
import sys
import threading
import traceback
import urllib.parse
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import ai as AIm
from store import STAGES, STAGE_AR, Store

VERSION = "1.3.0"
REPO = "ahmedqassimtv-commits/qassimz-producer"

mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("image/svg+xml", ".svg")


def resource(rel: str) -> Path:
    base = getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent)
    return Path(base) / rel


class Api:
    """Every public method is callable from the UI as POST /api/<name> with JSON kwargs."""

    def __init__(self, store: Store):
        self.s = store
        self.window = None      # pywebview window (for native dialogs)
        self.update_info = None

    # ------------------------------------------------------------------ app
    def info(self):
        st = self.s.settings()
        safe = {k: v for k, v in st.items() if not k.startswith("ai_key_")}
        safe["ai_keys"] = {p: bool(st.get(f"ai_key_{p}")) for p in AIm.PROVIDERS}
        return {"version": VERSION, "github": f"https://github.com/{REPO}", "support": f"https://github.com/{REPO}/issues",
                "site": "https://qassimz.com", "stages": STAGES, "stage_names": STAGE_AR, "settings": safe,
                "providers": {k: {"name": v["name"], "default_model": v["default_model"], "models": v["models"]} for k, v in AIm.PROVIDERS.items()},
                "update": self.update_info, "native": self.window is not None}

    def save_settings(self, values: dict):
        for k, v in (values or {}).items():
            if k.startswith("ai_key_") and v == "__keep__":
                continue
            self.s.set_setting(k, v)
        return self.info()["settings"]

    def dashboard(self):
        return self.s.dashboard()

    # ------------------------------------------------------------------ series / episodes
    def series_list(self): return self.s.series_list()
    def series_save(self, series: dict): return self.s.series_save(series)
    def series_delete(self, id): return self.s.series_delete(id)
    def episodes(self, series_id=None): return self.s.episodes(series_id)
    def episode(self, id): return self.s.episode(id)
    def episode_create(self, episode: dict): return self.s.episode_create(episode)
    def episode_update(self, id, fields: dict): return self.s.episode_update(id, fields)
    def episode_move(self, id, stage, before_id=None): return self.s.episode_move(id, stage, before_id)
    def episode_delete(self, id): return self.s.episode_delete(id)
    def episode_duplicate(self, id): return self.s.episode_duplicate(id)
    def scene_save(self, scene: dict): return self.s.scene_save(scene)
    def scene_delete(self, id): return self.s.scene_delete(id)
    def scenes_reorder(self, ids: list): return self.s.scenes_reorder(ids)
    def task_save(self, task: dict): return self.s.task_save(task)
    def task_delete(self, id): return self.s.task_delete(id)
    def source_save(self, source: dict): return self.s.source_save(source)
    def source_delete(self, id): return self.s.source_delete(id)

    # ------------------------------------------------------------------ library
    def assets(self, kind=None, q=None, episode_id=None): return self.s.assets(kind, q, episode_id)
    def asset(self, id): return self.s.asset(id)
    def asset_update(self, id, fields: dict): return self.s.asset_update(id, fields)
    def asset_delete(self, id, delete_file=False): return self.s.asset_delete(id, delete_file)
    def link(self, asset_id, episode_id, scene_id=0): return self.s.link(asset_id, episode_id, scene_id)
    def unlink(self, asset_id, episode_id, scene_id=0): return self.s.unlink(asset_id, episode_id, scene_id)
    def import_paths(self, paths: list, episode_id=None, scene_id=0): return self.s.import_files(paths, episode_id, scene_id)

    def import_dialog(self, episode_id=None, scene_id=0, folder=False):
        paths = self._pick(folder=folder, multiple=True)
        return self.s.import_files(paths, episode_id, scene_id) if paths else []

    # ------------------------------------------------------------------ board
    def board(self): return self.s.board()
    def board_save(self, item: dict): return self.s.board_save(item)
    def board_delete(self, id): return self.s.board_delete(id)
    def board_link(self, a, b): return self.s.board_link(a, b)
    def board_unlink(self, id): return self.s.board_unlink(id)

    def board_to_episode(self, id, series_id=None):
        it = self.s.one("SELECT * FROM board WHERE id=?", (id,))
        text = (it.get("text") or "").strip()
        title, _, rest = text.partition("\n")
        eid = self.s.episode_create({"title": title[:120] or "فكرة جديدة", "notes": rest.strip(), "series_id": series_id})
        self.s.board_save({"id": id, "episode_id": eid})
        return eid

    # ------------------------------------------------------------------ export / system
    def export_episode(self, id):
        d = self._pick(folder=True)
        if not d:
            return None
        return self.s.export_episode(id, d[0])

    def script_markdown(self, id):
        return self.s.script_markdown(self.s.episode(id))

    def backup(self):
        d = self._pick(folder=True)
        return self.s.backup(d[0]) if d else None

    def open_path(self, path):
        if os.name == "nt":
            os.startfile(path)  # type: ignore[attr-defined]
        else:
            subprocess.Popen(["xdg-open", path])
        return True

    def reveal(self, path):
        if not path:
            return False
        if os.name == "nt":
            subprocess.Popen(["explorer", "/select,", os.path.normpath(path)])
        elif sys.platform == "darwin":
            subprocess.Popen(["open", "-R", path])
        else:
            p = Path(path)
            target = str(p.parent if p.is_file() else p)
            subprocess.Popen(["xdg-open", target])
        return True

    def win_minimize(self) -> bool:
        if self.window is not None:
            try:
                self.window.minimize()
                return True
            except Exception:
                pass
        return False

    def win_toggle_maximize(self) -> bool:
        if self.window is not None:
            try:
                if getattr(self, "_is_maximized", False):
                    self.window.restore()
                    self._is_maximized = False
                else:
                    self.window.maximize()
                    self._is_maximized = True
                return self._is_maximized
            except Exception:
                pass
        return False

    def win_close(self) -> bool:
        if self.window is not None:
            try:
                self.window.destroy()
                return True
            except Exception:
                pass
        return False

    def open_url(self, url):
        if url.startswith(("http://", "https://")):
            webbrowser.open(url)
        return True

    def pick_folder(self):
        d = self._pick(folder=True)
        return d[0] if d else None

    def _pick(self, folder=False, multiple=False):
        if not self.window:
            return []
        import webview  # type: ignore
        t = webview.FOLDER_DIALOG if folder else webview.OPEN_DIALOG
        r = self.window.create_file_dialog(t, allow_multiple=multiple)
        return list(r or [])

    # ------------------------------------------------------------------ AI
    def _ai(self):
        return AIm.AI(self.s.settings())

    def ai_test(self):
        return self._ai().ask("قول «تمام» بس.", max_tokens=20)

    def ai_ideas(self, topic, series_id=None, n=6):
        series = self.s.one("SELECT * FROM series WHERE id=?", (series_id,)) if series_id else None
        existing = [e["title"] for e in self.s.episodes()]
        return AIm.ideas(self._ai(), topic, series, existing, n)

    def ai_outline(self, id, minutes=10, apply=True):
        e = self.s.episode(id)
        r = AIm.outline(self._ai(), e, minutes)
        if apply:
            if r.get("hook") and not e.get("hook"):
                self.s.episode_update(id, {"hook": r["hook"]})
            for sc in r.get("scenes", []):
                self.s.scene_save({"episode_id": id, **{k: sc.get(k, "") for k in ("heading", "text", "visual", "audio")}})
            if e["stage"] == "idea":
                self.s.episode_update(id, {"stage": "script"})
        return r

    def ai_rewrite(self, text, mode, episode_id=None):
        e = self.s.episode(episode_id) if episode_id else None
        return AIm.rewrite(self._ai(), text, mode, e)

    def ai_scene(self, scene_id):
        sc = self.s.one("SELECT * FROM scenes WHERE id=?", (scene_id,))
        e = self.s.episode(sc["episode_id"])
        r = AIm.scene_suggest(self._ai(), e, sc, self.s.assets())
        valid = {a["id"] for a in self.s.assets()}
        r["assets"] = [self.s.asset(int(i)) for i in r.get("assets", []) if str(i).isdigit() and int(i) in valid]
        return r

    def ai_tasks(self, id, apply=True):
        r = AIm.tasks(self._ai(), self.s.episode(id))
        if apply:
            for t in r.get("tasks", []):
                self.s.task_save({"episode_id": id, "text": t})
        return r

    def ai_publish(self, id, apply=True):
        r = AIm.publish(self._ai(), self.s.episode(id))
        if apply:
            self.s.episode_update(id, {"meta": {"publish": r}})
        return r

    def ai_research(self, id, text):
        return AIm.research(self._ai(), self.s.episode(id), text)

    def ai_tag(self, id):
        a = self.s.asset(id)
        th = self.s.thumb(id, 512)
        r = AIm.tag_asset(self._ai(), a, str(th) if th else None)
        tags = ", ".join(r.get("tags", []))
        self.s.asset_update(id, {"tags": tags, "note": r.get("note", "")})
        return {"tags": tags, "note": r.get("note", "")}

    def ai_board(self):
        notes = [i for i in self.s.board()["items"] if i["type"] == "note"]
        return AIm.organize_board(self._ai(), notes)

    def chat_log(self, episode_id=None): return self.s.chat_log(episode_id)
    def chat_clear(self, episode_id=None): return self.s.chat_clear(episode_id)

    def chat_send(self, message, episode_id=None):
        self.s.chat_add(episode_id, "user", message)
        hist = [{"role": m["role"], "content": m["content"]} for m in self.s.chat_log(episode_id)][-20:]
        sys_prompt = AIm.SYSTEM
        if episode_id:
            sys_prompt += "\n\nإنت دلوقتي بتساعد في الحلقة دي:\n" + AIm.episode_context(self.s.episode(episode_id))
        else:
            eps = self.s.episodes()
            sys_prompt += "\n\nالحلقات الحالية:\n" + "\n".join(f"- [{STAGE_AR[e['stage']]}] {e['title']}" for e in eps[:60])
        reply = self._ai().chat(hist, system=sys_prompt)
        self.s.chat_add(episode_id, "assistant", reply)
        return reply

    # ------------------------------------------------------------------ update
    def check_update(self):
        import urllib.request
        try:
            req = urllib.request.Request(f"https://api.github.com/repos/{REPO}/releases/latest", headers={"User-Agent": "QASSIMZ-Producer"})
            with urllib.request.urlopen(req, timeout=10, context=AIm._ctx()) as r:
                rel = json.loads(r.read().decode())
            tag = rel.get("tag_name", "").lstrip("vV")
            asset = next((a for a in rel.get("assets", []) if "setup" in a["name"].lower() and a["name"].endswith(".exe")), None)
            if asset and _ver(tag) > _ver(VERSION):
                self.update_info = {"version": tag, "url": asset["browser_download_url"]}
                return self.update_info
            return {"latest": True}
        except Exception as e:
            return {"error": str(e)}

    def install_update(self):
        import tempfile
        import urllib.request
        if not self.update_info:
            return False
        dst = Path(tempfile.gettempdir()) / f"QASSIMZ-Producer-Setup-{self.update_info['version']}.exe"
        req = urllib.request.Request(self.update_info["url"], headers={"User-Agent": "QASSIMZ-Producer"})
        with urllib.request.urlopen(req, timeout=120, context=AIm._ctx()) as r, open(dst, "wb") as f:
            f.write(r.read())
        subprocess.Popen([str(dst), "/SILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/CLOSEAPPLICATIONS"])
        threading.Timer(1.0, lambda: os._exit(0)).start()
        return True


def _ver(t):
    try:
        return tuple(int(x) for x in t.split(".")[:3])
    except Exception:
        return (0,)


# ====================================================================== HTTP
def make_handler(api: Api, token: str, ui_dir: Path):
    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def _send(self, code, body: bytes, ctype="application/json; charset=utf-8", extra=None):
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store" if ctype.startswith("application/json") else "max-age=3600")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def _authed(self):
            return self.path.startswith(f"/{token}/")

        def do_GET(self):
            if not self._authed():
                return self._send(403, b"forbidden", "text/plain")
            path = urllib.parse.unquote(self.path[len(token) + 1:].split("?")[0])
            try:
                if path.startswith("/thumb/"):
                    p = api.s.thumb(int(path.split("/")[2]))
                    return self._file(p) if p else self._send(404, b"", "text/plain")
                if path.startswith("/file/"):
                    a = api.s.one("SELECT path FROM assets WHERE id=?", (int(path.split("/")[2]),))
                    return self._file(Path(a["path"])) if a and os.path.exists(a["path"]) else self._send(404, b"", "text/plain")
                if path in ("/", ""):
                    path = "/index.html"
                f = (ui_dir / path.lstrip("/")).resolve()
                if ui_dir.resolve() not in f.parents or not f.is_file():
                    return self._send(404, b"not found", "text/plain")
                return self._file(f)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass

        do_HEAD = do_GET

        def _file(self, p: Path):
            size = p.stat().st_size
            ctype = mimetypes.guess_type(str(p))[0] or "application/octet-stream"
            if p.suffix == ".js":
                ctype = "text/javascript; charset=utf-8"
            elif p.suffix == ".css":
                ctype = "text/css; charset=utf-8"
            elif p.suffix == ".html":
                ctype = "text/html; charset=utf-8"
            if size == 0:
                self.send_response(200)
                self.send_header("Content-Type", ctype)
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            rng = self.headers.get("Range")
            start, end, code = 0, size - 1, 200
            if rng and rng.startswith("bytes="):
                a, _, b = rng[6:].split(",", 1)[0].partition("-")
                try:
                    if a == "" and b:
                        start = max(0, size - int(b))
                        end = size - 1
                    else:
                        start = int(a or 0)
                        end = min(int(b) if b else size - 1, size - 1)
                    if start < 0 or start >= size or start > end:
                        self.send_response(416)
                        self.send_header("Content-Range", f"bytes */{size}")
                        self.send_header("Content-Length", "0")
                        self.end_headers()
                        return
                    code = 206
                except ValueError:
                    start, end, code = 0, size - 1, 200
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Length", str(end - start + 1))
            if code == 206:
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            else:
                self.send_header("Cache-Control", "max-age=3600")
            self.end_headers()
            if self.command == "HEAD":
                return
            with open(p, "rb") as fh:
                fh.seek(start)
                left = end - start + 1
                while left > 0:
                    chunk = fh.read(min(65536, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)

        def do_POST(self):
            if not self._authed():
                return self._send(403, b"forbidden", "text/plain")
            name = self.path[len(token) + 1:].split("?")[0].removeprefix("/api/")
            fn = getattr(api, name, None)
            if name.startswith("_") or not callable(fn):
                return self._send(404, b'{"error":"unknown"}')
            try:
                n = int(self.headers.get("Content-Length") or 0)
                args = json.loads(self.rfile.read(n) or b"{}") if n else {}
                res = fn(**args)
                body = json.dumps({"ok": True, "data": res}, ensure_ascii=False, default=str)
            except AIm.AIError as e:
                body = json.dumps({"ok": False, "error": str(e), "ai": True}, ensure_ascii=False)
            except Exception as e:
                traceback.print_exc()
                body = json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False)
            self._send(200, body.encode("utf-8"))

    return H


def start_server(api: Api, port=0):
    token = secrets.token_urlsafe(16)
    httpd = ThreadingHTTPServer(("127.0.0.1", port), make_handler(api, token, resource("app/ui")))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{httpd.server_address[1]}/{token}/"
