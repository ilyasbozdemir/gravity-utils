const fs = require('fs');

let content = fs.readFileSync('apps/web/src/app/page.tsx', 'utf-8');

// 1. Change dynamic from next/dynamic to lazy from react
content = content.replace(/import dynamic from 'next\/dynamic';/, 'import React, { lazy, Suspense } from \'react\';');

// 2. Change dynamic(() => import(...)) to lazy(() => import(...).then(mod => ({ default: mod.Component })))
// We need to carefully match the dynamic calls.
// The regex looks for: `const Name = dynamic(() => import('something').then(mod => mod.Name)`
content = content.replace(/const (\w+) = dynamic\(\(\) => import\('([^']+)'\)\.then\(mod => mod\.(\w+)\)[^)]*\);/g, 
    "const $1 = lazy(() => import('$2').then(mod => ({ default: mod.$3 })));");

// Also handle the ones with { ssr: false }
content = content.replace(/const (\w+) = dynamic\(\(\) => import\('([^']+)'\)\.then\(mod => mod\.(\w+)\), \{ ssr: false \}\);/g, 
    "const $1 = lazy(() => import('$2').then(mod => ({ default: mod.$3 })));");

// 3. Change @/components to ../components or import from shared
// In desktop, components are usually in ../components or we should alias it. 
// For now, let's keep @/components if desktop Vite uses alias (it doesn't have @/components alias in desktop?)
// Desktop has @shared/index but not @/components.
content = content.replace(/@\/components/g, '../../web/src/components');

// 4. Update Sidebar import (Desktop sidebar is now in apps/desktop/src/components/Sidebar)
content = content.replace(/import \{ Sidebar, ToolView as ViewType \} from '..\/..\/web\/src\/components\/Sidebar';/, "import { Sidebar, ToolView as ViewType } from '../components/Sidebar';");

// 5. Replace export default function Home() with export default function HomeView({ onAction }) 
content = content.replace(/export default function Home\(\) \{/, 'export default function HomeView() {\n    // Extracted from web page.tsx');

// Wrap the main return in Suspense
content = content.replace(/\{view === 'pdf'/, "<Suspense fallback={<div className=\"flex-1 flex items-center justify-center p-20\"><div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500\"></div></div>}>\n                            {view === 'pdf'");
content = content.replace(/\{view === 'dev-tools' && <DevTools onBack=\{\(\) => setView\('home'\)\} \/>\}/, "{view === 'dev-tools' && <DevTools onBack={() => setView('home')} />}\n                            </Suspense>");

fs.writeFileSync('apps/desktop/src/views/HomeView.tsx', content);
console.log('Transformed HomeView.tsx successfully.');
