const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'packages', 'shared', 'src', 'components');

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
        const p = path.join(dir, file);
        let content = fs.readFileSync(p, 'utf8');
        if (!content.startsWith('"use client"') && !content.startsWith('\'use client\'')) {
            fs.writeFileSync(p, '"use client";\n\n' + content);
            console.log('Added use client to', file);
        }
    }
});
