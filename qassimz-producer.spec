# PyInstaller spec — one-folder build (fast startup)
from PyInstaller.utils.hooks import collect_all
datas = [("app/ui", "app/ui"), ("assets/logo.png", "assets"), ("assets/logo.ico", "assets"), ("README.md", ".")]
binaries, hiddenimports = [], []
for pkg in ("webview", "docx", "certifi"):
    d, b, h = collect_all(pkg); datas += d; binaries += b; hiddenimports += h
a = Analysis(["app/main.py"], pathex=["app"], datas=datas, binaries=binaries,
             hiddenimports=hiddenimports + ["store", "ai", "server"], excludes=["tkinter", "numpy"])
pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name="QASSIMZ Producer",
          icon="assets/logo.ico", console=False, version="installer/version.txt")
coll = COLLECT(exe, a.binaries, a.datas, name="QASSIMZ Producer")
