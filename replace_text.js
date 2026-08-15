const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { search: /Adyel Day and Boarding Primary School/g, replace: "Lira Town College" },
  { search: /Adyel Primary School/g, replace: "Lira Town College" },
  { search: /Adyel Primary/g, replace: "Lira Town College" },
  { search: /Adyel Alumni Association/g, replace: "LTC Class of 2016 Alumni Network" },
  { search: /Adyel Alumni Network/g, replace: "LTC Class of 2016 Alumni Network" },
  { search: /Adyel Alumni/g, replace: "LTC Alumni" },
  { search: /Adyelites/g, replace: "LTC Alumni" },
  { search: /Adyelite/g, replace: "LTC Alumnus" },
  { search: /Adyel/g, replace: "LTC" },
];

walkDir(path.join(__dirname, 'src/app'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
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
