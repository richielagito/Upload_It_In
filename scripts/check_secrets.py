#!/usr/bin/env python3
"""Scan repository files for secret-like literals and exit non-zero if any found.

Usage: python scripts/check_secrets.py [path]
If path omitted, scans repository root (parent of this script's parent).
"""
from __future__ import annotations
import argparse
import os
import re
import sys
from pathlib import Path

# Configuration: file extensions to scan and regex patterns
TEXT_EXTS = {'.py', '.js', '.ts', '.jsx', '.tsx', '.md', '.env', '.json', '.yml', '.yaml'}

PATTERNS = {
    # jwt-like tokens (keeps original behavior)
    'jwt_like': re.compile(r'(?:e' r'yJ)[A-Za-z0-9_-]{10,}'),
    # long_base64: conservative match only for long quoted base64-like strings
    # - require surrounding quotes to avoid matching long paths/urls
    # - exclude path separators (/) and dots which commonly appear in URLs
    'long_base64': re.compile(r'["\']([A-Za-z0-9+]{40,}={0,2})["\']'),
    # assignments like SUPABASE_*KEY = "..."
    'supabase_key_assign': re.compile(r'(SUPABASE_[A-Z0-9_]*KEY)\s*=\s*["\']([^"\']+)["\']'),
    'gemini_key_assign': re.compile(r'(GEMINI_API_KEY)\s*=\s*["\']([^"\']+)["\']'),
}

EXCLUDE_DIRS = {'.git', '__pycache__', 'node_modules', '.venv', 'venv', '.sisyphus', '.next'}
EXCLUDE_FILES = {'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'skills-lock.json'}
EXCLUDE_PATH_CONTAINS = {
    'uploaditin_backend/static/db.js',
    'uploaditin_v2/lib/supabase.js',
}


def is_text_file(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTS


def scan_path(root: Path):
    findings = []
    for dirpath, dirnames, filenames in os.walk(root):
        # modify dirnames in-place to skip excluded directories
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
        for fname in filenames:
            path = Path(dirpath) / fname
            if not is_text_file(path):
                continue
            normalized = str(path).replace('\\', '/').lower()
            if any(skip in normalized for skip in EXCLUDE_PATH_CONTAINS):
                continue
            try:
                text = path.read_text(encoding='utf-8')
            except Exception:
                # skip binary/unreadable
                continue
            for lineno, line in enumerate(text.splitlines(), start=1):
                # skip specific files known to contain lockfile integrity hashes
                if path.name in EXCLUDE_FILES:
                    break
                for name, regex in PATTERNS.items():
                    for m in regex.finditer(line):
                        matched = m.group(1) if m.groups() else m.group(0)
                        findings.append((path, lineno, name, matched))
    return findings


def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument('path', nargs='?', help='path to scan (defaults to repo root)')
    args = p.parse_args(argv)

    if args.path:
        root = Path(args.path)
    else:
        # repo root: parent of this script's parent
        root = Path(__file__).resolve().parents[1]

    findings = scan_path(root)
    if findings:
        for path, lineno, kind, matched in findings:
            # Print file:path:line and kind; do not print full environment values in env-contract script
            print(f'{path}:{lineno}: {kind}: {matched}')
        print(f'Found {len(findings)} secret-like literal(s).', file=sys.stderr)
        return 1
    print('No secret-like literals found.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
