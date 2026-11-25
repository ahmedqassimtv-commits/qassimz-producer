"""Run the app in a normal browser (no pywebview) — for development & testing."""
import sys
import time
from pathlib import Path

from server import Api, start_server
from store import Store

if __name__ == "__main__":
    d = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/qp-data")
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    url = start_server(Api(Store(d)), port)
    print(url, flush=True)
    while True:
        time.sleep(3600)
