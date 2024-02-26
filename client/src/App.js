import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Autocomplete, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function App() {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [gramAmount, setGramAmount] = useState('');
  const [foodList, setFoodList] = useState([]);
  const [carbonFootprint, setCarbonFootprint] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/foods')
      .then(response => setFoods(response.data))
      .catch(error => console.error('There was an error!', error));
  }, []);

  const handleAddFood = () => {
    if (selectedFood && gramAmount) {
      setFoodList([...foodList, { name: selectedFood.name, grams: gramAmount }]);
      setSelectedFood(null);
      setGramAmount('');
    }
  };

  const calculateCarbonFootprint = () => {
    axios.post('http://localhost:3001/calculate', { items: foodList })
      .then(response => setCarbonFootprint(response.data.totalCarbonFootprint))
      .catch(error => console.error('There was an error!', error));
  };

  return (
    <div style={{ margin: '20px' }}>
      <Autocomplete
        options={foods}
        getOptionLabel={(option) => option.name}
        onChange={(event, newValue) => setSelectedFood(newValue)}
        renderInput={(params) => <TextField {...params} label="Select Food" variant="outlined" />}
      />
      <TextField
        label="Gram Amount"
        type="number"
        value={gramAmount}
        onChange={(e) => setGramAmount(e.target.value)}
        variant="outlined"
        style={{ margin: '10px 0' }}
      />
      <Button variant="contained" color="primary" onClick={handleAddFood} startIcon={<AddCircleOutlineIcon />}>
        Add
      </Button>
      <List>
        {foodList.map((food, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${food.name}: ${food.grams} grams`} />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" color="secondary" onClick={calculateCarbonFootprint} style={{ marginTop: '20px' }}>
        Calculate Carbon Footprint
      </Button>
      {carbonFootprint && <div style={{ marginTop: '20px' }}>Total Carbon Footprint: {carbonFootprint} kgCO2eq</div>}
    </div>
  );
}

export default App;
