import re

files = [
    r'C:/dev/ecosan/frontend/src/main.jsx',
    r'C:/dev/ecosan/frontend/src/App.jsx',
    r'C:/dev/ecosan/frontend/src/pages/FleetLogistics.jsx',
    r'C:/dev/ecosan/frontend/src/pages/Analytics.jsx',
    r'C:/dev/ecosan/frontend/src/pages/AISegregationHub.jsx',
    r'C:/dev/ecosan/frontend/src/pages/LiveOperations.jsx',
    r'C:/dev/ecosan/frontend/src/pages/SanitizationIndex.jsx',
    r'C:/dev/ecosan/frontend/src/components/layout/TopBar.jsx',
    r'C:/dev/ecosan/frontend/src/components/layout/Sidebar.jsx',
    r'C:/dev/ecosan/frontend/src/components/layout/Layout.jsx',
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        content = fp.read()
    has_react_namespace_import = 'import React' in content
    uses_react_namespace = bool(re.search(r'React\.(useState|useEffect|useContext|useRef|useMemo|useCallback|createContext|useReducer)', content))
    uses_named_imports = bool(re.search(r'from [\"\']react[\"\']', content))
    print(f'{f}:')
    print(f'  import React: {has_react_namespace_import}')
    print(f'  Uses React.xxx: {uses_react_namespace}')
    print(f'  Uses named imports from react: {uses_named_imports}')
    if uses_react_namespace and not has_react_namespace_import:
        print(f'  *** MISSING: import React from "react" ***')
    print()