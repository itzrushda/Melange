// build_webapp.js
// Melange Event Management Web App Build Script
const fs = require('fs');
const path = require('path');

const publicIndex = path.join(__dirname, 'public', 'index.html');
const rootIndex = path.join(__dirname, 'index.html');

// Keep public/index.html and root index.html synchronized
if (fs.existsSync(publicIndex)) {
  fs.copyFileSync(publicIndex, rootIndex);
  console.log('Synchronized public/index.html to root index.html (' + fs.statSync(publicIndex).size + ' bytes)');
} else if (fs.existsSync(rootIndex)) {
  fs.copyFileSync(rootIndex, publicIndex);
  console.log('Synchronized root index.html to public/index.html (' + fs.statSync(rootIndex).size + ' bytes)');
}
