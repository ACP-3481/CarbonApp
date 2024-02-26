const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for React app development
app.use(cors());

// Sample data structure for foods and their carbon footprint values
const foods = [
  { name: 'Apple', kgCo2eqPerGram: 0.00024 },
  { name: 'Beef', kgCo2eqPerGram: 0.027 },
  // Add more foods here
];

// Endpoint to get list of foods
app.get('/foods', (req, res) => {
  res.json(foods);
});

// Endpoint to calculate carbon footprint
app.post('/calculate', express.json(), (req, res) => {
  const { items } = req.body; // items = [{ name: 'Food Name', grams: 100 }, ...]
  const totalCarbonFootprint = items.reduce((total, item) => {
    const food = foods.find(f => f.name === item.name);
    if (food) {
      return total + (item.grams * food.kgCo2eqPerGram);
    }
    return total;
  }, 0);
  res.json({ totalCarbonFootprint });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
