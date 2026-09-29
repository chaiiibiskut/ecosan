with open(r'C:/dev/ecosan/frontend/src/pages/SanitizationIndex.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the JS expression - replace entity with literal <
# Search for the entity version, replace with literal
content = content.replace('site.SVI < 60 ?', 'site.SVI < 60 ?')

with open(r'C:/dev/ecosan/frontend/src/pages/SanitizationIndex.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed JS expression')