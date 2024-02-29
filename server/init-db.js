const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./carbon_footprint.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the carbon footprint database.');
});

db.serialize(() => {
  // Create table
  db.run(`CREATE TABLE IF NOT EXISTS user_footprint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userid TEXT NOT NULL,
    date TEXT NOT NULL,
    carbon_footprint REAL NOT NULL,
    UNIQUE(userid, date)
  );
  `);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    userid TEXT PRIMARY KEY UNIQUE,
    display_name TEXT NOT NULL,
    salt TEXT NOT NULL,
    hash TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER DEFAULT 0 NOT NULL
  )`)

  console.log('Table created or already exists.');
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Closed the database connection.');
});
