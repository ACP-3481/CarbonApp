const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const foodValues = require('./values/food'); // Adjusted to use require for CommonJS
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use('/images', express.static('images'));

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir, { recursive: true });
}


const db = new sqlite3.Database('./carbon_footprint.db');

// Convert food values from kgCO2eq to gCO2eq for each food item
const foods = Object.entries(foodValues).map(([name, kgCo2eq]) => ({
  name,
  kgCo2eqPerGram: kgCo2eq / 1000, // Convert kgCO2eq to gCO2eq
}));

// Endpoint to get list of foods
app.get('/foods', (req, res) => {
  res.json(foods);
});

// Endpoint to calculate carbon footprint
app.post('/calculate', express.json(), (req, res) => {
  const { items, date } = req.body; // items = [{ name: 'Food Name', grams: 100 }, ...]
  const userid = 'defaultUser';
  const stmt = `INSERT INTO user_footprint (userid, date, carbon_footprint)
                VALUES (?, ?, ?)
                ON CONFLICT(userid, date) DO UPDATE SET carbon_footprint = carbon_footprint + ?`;
  const totalCarbonFootprint = items.reduce((total, item) => {
    const food = foods.find(f => f.name === item.name);
    if (food) {
      return total + (item.grams * food.kgCo2eqPerGram);
    }
    return total;
  }, 0);
  db.run(stmt, [userid, date, totalCarbonFootprint, totalCarbonFootprint], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.json({ message: 'Success', totalCarbonFootprint: totalCarbonFootprint });
  });
});

app.get('/history', (req, res) => {
  const userid = 'defaultUser'; // Use the appropriate user identification method
  db.all(`SELECT date, carbon_footprint FROM user_footprint WHERE userid = ? ORDER BY date ASC`, [userid], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error fetching history');
      return;
    }
    res.json(rows);
  });
});

app.post('/save-graph', express.json({limit: '50mb'}), (req, res) => {
  const { imageData } = req.body; // Base64 encoded image data
  const imageName = `graph_${Math.random().toString(36).substring(2, 15)}.png`;
  const imagePath = path.join(__dirname, 'images', imageName);

  // Decode image data and save the file
  const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(imagePath, base64Data, 'base64', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving image');
      return;
    }
    res.send({ imageUrl: `http://127.0.0.1:3001/images/${imageName}` }); // Adjust the URL/port as necessary
  });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
