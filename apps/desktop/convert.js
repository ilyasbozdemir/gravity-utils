const fs = require('fs');
const pngToIco = require('png-to-ico').default;

pngToIco('public/logo.png')
  .then(buf => {
    fs.writeFileSync('electron/icon.ico', buf);
    console.log('Icon converted successfully!');
  })
  .catch(err => {
    console.error('Error converting icon:', err);
    process.exit(1);
  });
