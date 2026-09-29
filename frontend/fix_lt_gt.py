import re

# Fix SanitizationIndex.jsx
with open(r'C:\dev\ecosan\frontend\src\pages\SanitizationIndex.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix "SVI < 60" in JSX text (the one in the map legend)
content = content.replace('text-neutral-600">SVI < 60</span>', 'text-neutral-600">SVI < 60</span>')

with open(r'C:\dev\ecosan\frontend\src\pages\SanitizationIndex.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix LiveOperations.jsx
with open(r'C:\dev\ecosan\frontend\src\pages\LiveOperations.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix "Normal (< 70%)" in JSX text
content = content.replace('text-neutral-600">Normal (< 70%)</span>', 'text-neutral-600">Normal (< 70%)</span>')

# Fix "Critical (> 90%)" in JSX text
content = content.replace('text-neutral-600">Critical (> 90%)</span>', 'text-neutral-600">Critical (> 90%)</span>')

with open(r'C:\dev\ecosan\frontend\src\pages\LiveOperations.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix AISegregationHub.jsx - "confidence < 70%" in JSX text
with open(r'C:\dev\ecosan\frontend\src\pages\AISegregationHub.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('text-sm text-neutral-700">Notify when confidence < 70%</span>', 'text-sm text-neutral-700">Notify when confidence < 70%</span>')

with open(r'C:\dev\ecosan\frontend\src\pages\AISegregationHub.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("All fixes applied!")