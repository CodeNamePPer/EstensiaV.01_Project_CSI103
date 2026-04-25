import os

files = [
    r"e:\Project04A\test\Player101\Character_Selection\Char_Select.html",
    r"e:\Project04A\test\Player101\classPlayer01.js",
    r"e:\Project04A\test\Player101\GameTest.html"
]

def inspect_thai_names(filepath):
    print(f"\n--- Inspecting {filepath} ---")
    if not os.path.exists(filepath):
        print("File not found")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        # Look for the character names
        names = ["นักดาบ", "จอมเวทย์", "นักเวท", "นักธนู", "มือปืน"]
        for name in names:
            if name in content:
                # Find all occurrences and print their char codes
                start = 0
                while True:
                    idx = content.find(name, start)
                    if idx == -1: break
                    # Get surrounding context
                    context = content[max(0, idx-5):min(len(content), idx+len(name)+5)]
                    codes = [ord(c) for c in name]
                    print(f"Found '{name}' at {idx}. Context: '{context.replace('\n', '\\n')}'")
                    print(f"  Codes: {codes}")
                    start = idx + 1

for f in files:
    inspect_thai_names(f)
