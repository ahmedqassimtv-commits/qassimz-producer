"""QASSIMZ Producer — desktop entry point."""
from __future__ import annotations

import os
import sys
import threading
import time
from pathlib import Path

import webview  # pywebview

from server import Api, resource, start_server
from store import Store


def data_dir() -> Path:
    return Path(os.environ.get("APPDATA", Path.home())) / "QASSIMZ Producer"


def main():
    store = Store(data_dir())
    api = Api(store)
    url = start_server(api)
    win = webview.create_window("QASSIMZ Producer", url, width=1360, height=860, min_size=(1100, 700),
                                background_color="#0b0714", text_select=True)
    api.window = win

    def boot():
        if store.settings().get("auto_update", True):
            time.sleep(4)
            api.check_update()

    threading.Thread(target=boot, daemon=True).start()
    webview.start(gui="edgechromium" if os.name == "nt" else None, debug="--debug" in sys.argv,
                  icon=str(resource("assets/logo.png")), private_mode=False,
                  storage_path=str(data_dir() / "webview"))


if __name__ == "__main__":
    main()
