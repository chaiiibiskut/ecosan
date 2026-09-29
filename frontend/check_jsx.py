import re
import os

issues = []
for root, dirs, files in os.walk(r'C:\dev\ecosan\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            for m in re.finditer(r'>([^<]*[<>]\s*\d[^<]*)<', content):
                start = max(0, m.start()-30)
                end = min(len(content), m.end()+30)
                context = content[start:end]
                if not any(op in context for op in ['?', ':', '&&', '||', '==', '!=', '<=', '>=', '=>', 'const ', 'let ', 'var ', 'return ', 'if (', 'for (', 'while (']):
                    issues.append((path, m.group(1).strip()))

for path, text in issues:
    print(f'{path}: "{text}"')

if not issues:
    print('No remaining JSX text issues found!')