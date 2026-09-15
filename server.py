#!/usr/bin/env python3
"""Zero-dependency local server for MemoryLab."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent / "web"
os.chdir(ROOT)
print("MemoryLab running at http://127.0.0.1:8000")
ThreadingHTTPServer(("127.0.0.1", 8000), SimpleHTTPRequestHandler).serve_forever()
