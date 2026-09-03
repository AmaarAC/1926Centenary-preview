#!/usr/bin/env python3
"""Static preview server for the review copy.

Identical to `python3 -m http.server` except every response carries
Cache-Control: no-store, so edits to the built HTML/CSS show up on reload
instead of being masked by the browser cache.
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
    ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
