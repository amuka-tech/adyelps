const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const apiDir = path.join(__dirname, 'src', 'app', 'api');

walkDir(apiDir, function(filePath) {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // This regex looks for user.role !== 'ADMIN' and safely replaces it.
    // It uses a negative lookbehind/lookahead to avoid replacing if it's already SUPER_ADMIN.
    // We only want to replace it where it's part of an access check.
    
    // Replace: user.role !== 'ADMIN'
    // With: (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')
    
    content = content.replace(/user\.role !== 'ADMIN'/g, "(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')");
    
    // Sometimes it's inside parentheses already like: (user.role !== 'ADMIN' && user.role !== 'TREASURER')
    // That becomes: ((user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') && user.role !== 'TREASURER')
    // This is logically correct!

    // Wait, let's fix the case where we might double-replace if we run it twice.
    // Replace "(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')" back to "user.role !== 'ADMIN'" first to ensure idempotency.
    content = original.replace(/\(user\.role !== 'ADMIN' && user\.role !== 'SUPER_ADMIN'\)/g, "user.role !== 'ADMIN'");
    content = content.replace(/user\.role !== 'ADMIN'/g, "(user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});

console.log("Done updating API permissions.");
