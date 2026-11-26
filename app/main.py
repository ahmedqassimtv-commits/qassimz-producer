"""QASSIMZ Producer — desktop entry point."""
from __future__ import annotations

import os
import sys
import threading
import time
from pathlib import Path

# Guard stdio under PyInstaller --noconsole so libraries/tracebacks never crash on None streams
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w", encoding="utf-8")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w", encoding="utf-8")

import webview  # pywebview

from server import Api, resource, start_server
from store import Store


def data_dir() -> Path:
    return Path(os.environ.get("APPDATA", Path.home())) / "QASSIMZ Producer"


def main():
    store = Store(data_dir())
    api = Api(store)
    url = start_server(api)
    win = webview.create_window(
        "QASSIMZ Producer",
        url,
        width=1360,
        height=860,
        min_size=(1100, 700),
        background_color="#f6f3ee",
        frameless=True,
        easy_drag=False,
        text_select=True,
    )
    api.window = win
    api._is_maximized = False

    def boot():
        if store.settings().get("auto_update", True):
            time.sleep(4)
            api.check_update()

    threading.Thread(target=boot, daemon=True).start()
    webview.start(
        gui="edgechromium" if os.name == "nt" else None,
        debug="--debug" in sys.argv,
        icon=str(resource("assets/logo.ico" if os.name == "nt" else "assets/logo.png")),
        private_mode=False,
        storage_path=str(data_dir() / "webview"),
    )


if __name__ == "__main__":
    main()
