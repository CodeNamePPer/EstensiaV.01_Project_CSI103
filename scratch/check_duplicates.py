import re
import os

files = [
    r"e:\Project04A\test\Player101\GameTest.html",
    r"e:\Project04A\test\Player101\enemyandboss.js",
    r"e:\Project04A\test\Player101\classPlayer01.js",
    r"e:\Project04A\test\Player101\Logicgame.js",
    r"e:\Project04A\test\Player101\levels.js",
    r"e:\Project04A\test\Player101\aim.js",
    r"e:\Project04A\test\Player101\buy.js"
]

def find_duplicates(filepath):
    print(f"\n--- Checking {filepath} ---")
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        # Look for const Name = ... or let Name = ... or class Name ...
        pattern = r"(const|let|var|class)\s+([a-zA-Z0-9_]+)\s*"
        matches = re.findall(pattern, content)
        
        seen = {}
        for kind, name in matches:
            if name in seen:
                print(f"Warning: Duplicate declaration of '{name}' ({kind} vs {seen[name]})")
            else:
                seen[name] = kind

find_duplicates(r"e:\Project04A\test\Player101\GameTest.html")
# Also check for global collisions across files
all_globals = {}
for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as content_f:
        content = content_f.read()
        matches = re.findall(r"^(const|let|var|class)\s+([a-zA-Z0-9_]+)", content, re.MULTILINE)
        for kind, name in matches:
            if name in all_globals:
                print(f"Global Clash: '{name}' declared in {f} ({kind}) and {all_globals[name]['file']} ({all_globals[name]['kind']})")
            else:
                all_globals[name] = {'kind': kind, 'file': f}
