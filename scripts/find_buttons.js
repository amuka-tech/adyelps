const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function findButtons(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findButtons(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('<button') && !line.includes('onClick') && !line.includes('type="submit"') && !line.includes('disabled')) {
          // Check if it spans multiple lines
          let tag = line;
          let j = i;
          while (!tag.includes('>') && j < lines.length - 1) {
            j++;
            tag += lines[j];
          }
          if (!tag.includes('onClick') && !tag.includes('type="submit"') && !tag.includes('disabled')) {
             console.log(`[${fullPath.replace(srcDir, '')}:${i+1}] ${line.trim()}`);
          }
        }
      }
    }
  }
}

findButtons(srcDir);
