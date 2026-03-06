const fs = require('fs');
let content = fs.readFileSync('src/views/HomeView.tsx', 'utf8');
content = content.replace(/\.\.\/\.\.\/web\/src\/components/g, '@/components');
content = content.replace(/\.\.\/components\/Sidebar/g, '@/components/Sidebar');
fs.writeFileSync('src/views/HomeView.tsx', content);
console.log('Restored aliases');
