import re

# Verify fixes
files_to_check = [
    (r'C:\dev\ecosan\frontend\src\pages\SanitizationIndex.jsx', 'text-neutral-600">SVI < 60</span>'),
    (r'C:\dev\ecosan\frontend\src\pages\LiveOperations.jsx', 'text-neutral-600">Normal (< 70%)</span>'),
    (r'C:\dev\ecosan\frontend\src\pages\LiveOperations.jsx', 'text-neutral-600">Critical (> 90%)</span>'),
    (r'C:\dev\ecosan\frontend\src\pages\AISegregationHub.jsx', 'Notify when confidence < 70%'),
]

for filepath, search_str in files_to_check:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    idx = content.find(search_str)
    if idx >= 0:
        print(f"FIXED: {filepath} - '{search_str}' uses entity")
    else:
        print(f"NOT FIXED: {filepath} - '{search_str}'")

# Also check for any remaining literal < or > followed by digits in JSX text
print("\n--- Checking for any remaining issues ---")
for filepath in [r'C:\dev\ecosan\frontend\src\pages\SanitizationIndex.jsx',
                  r'C:\dev\ecosan\frontend\src\pages\LiveOperations.jsx',
                  r'C:\dev\ecosan\frontend\src\pages\AISegregationHub.jsx',
                  r'C:\dev\ecosan\frontend\src\pages\FleetLogistics.jsx',
                  r'C:\dev\ecosan\frontend\src\pages\Analytics.jsx']:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Find patterns like >text< or >text< in JSX text (between > and <)
    for m in re.finditer(r'>[^<]*[<>]\s*\d', content):
        start = max(0, m.start()-20)
        end = min(len(content), m.end()+20)
        context = content[start:end]
        # Filter out JavaScript expressions (like a < b, a > b)
        if 'className' not in context[start:m.start()-start] and 'style' not in context[start:m.start()-start]:
            print(f"  {filepath}: {repr(context)}")