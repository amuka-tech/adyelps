const sqlite3 = require('sqlite3');
const fs = require('fs');
const db = new sqlite3.Database('database.sqlite');
db.all('SELECT sql FROM sqlite_master', (err, rows) => {
  if (err) console.error(err);
  else {
    fs.writeFileSync('schema.txt', rows.map(r => r.sql).join('\n'));
    console.log('Schema dumped to schema.txt');
  }
});
