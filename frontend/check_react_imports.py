import os
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
    has_react_import = 'import React' in content or 'from "react"' in content or "from 'react'" in content
    uses_react = bool(re.search(r'React\.(useState|useEffect|useContext|useRef|useMemo|useCallback|createContext|useReducer|useImperativeHandle|useLayoutEffect|useDebugValue)', content))
    uses_jsx = '<' in content and '/>' in content or '<' in content and '</' in content
    print(f'{f}:')
    print(f'  Has React import: {has_react_import}')
    print(f'  Uses React hooks: {uses_react}')
    print(f'  Uses JSX: {uses_jsx}')
    if uses_react and not has_react_import:
        print(f'  *** MISSING IMPORT ***')
    print()