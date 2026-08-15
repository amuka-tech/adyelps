const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    if (f === 'node_modules' || f === '.git' || f === '.next') return;
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const replacements = [
  { search: /Lira Town College \(LTC\)/g, replace: "Adyel Primary School" },
  { search: /Lira Town College/g, replace: "Adyel Primary School" },
  { search: /LTC Adyel Alumni/g, replace: "Adyel Alumni" },
  { search: /LTC Adyel/g, replace: "Adyel" },
  { search: /LTC Class of 2016/g, replace: "Adyel Class of 2016" },
  { search: /LTC Alumni/g, replace: "Adyel Alumni" },
  { search: /LTC Alumnus/g, replace: "Adyelite" },
  { search: /LTC Shop/g, replace: "Adyel Shop" },
  { search: /LTC Admin/g, replace: "Adyel Admin" },
  { search: /LTC Family/g, replace: "Adyel Family" },
  { search: /Oh LTC/g, replace: "Oh Adyel" },
  { search: /Once an LTC/g, replace: "Once an Adyel" },
  { search: /\bLTC\b/g, replace: "Adyel" }
];

walkDir(__dirname, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.md')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const r of replacements) {
      content = content.replace(r.search, r.replace);
    }
    
    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
