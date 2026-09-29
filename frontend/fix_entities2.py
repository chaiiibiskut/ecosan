with open(r'C:/dev/ecosan/frontend/src/pages/LiveOperations.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace using actual HTML entity codes
content = content.replace('Normal (< 70%)', 'Normal (< 70%)')
content = content.replace('Critical (> 90%)', 'Critical (> 90%)')

with open(r'C:/dev/ecosan/frontend/src/pages/LiveOperations.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('LiveOperations.jsx fixed')

with open(r'C:/dev/ecosan/frontend/src/pages/SanitizationIndex.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('SVI < 60', 'SVI < 60')

with open(r'C:/dev/ecosan/frontend/src/pages/SanitizationIndex.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('SanitizationIndex.jsx fixed')