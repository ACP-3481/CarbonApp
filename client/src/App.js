import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Tab, Tabs, TextField, Button, List, ListItem, ListItemText, Autocomplete } from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // For Chart.js v3 or newer


const dayjs = require('dayjs');

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [gramAmount, setGramAmount] = useState('');
  const [foodList, setFoodList] = useState([]);
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [autocompleteKey, setAutocompleteKey] = useState(0); // New state to track the key
  const [tabValue, setTabValue] = useState('1');
  const [selectedDate, setSelectedDate] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const chartRef = useRef(null);

  const handleSaveChartImage = () => {
    if (chartRef.current) {
      const chart = chartRef.current; // No need for .chartInstance
      const imageData = chart.toBase64Image();
      
      // Now, you can use imageData to save the image or share it
      console.log(imageData); // This logs the base64 image data

      axios.post('http://localhost:3001/save-graph', { imageData })
      .then(response => {
        // Here you would handle the response, e.g., storing the returned image URL
        console.log(response.data.imageUrl); // Assuming your server responds with the image URL
      })
      .catch(error => console.error('Error saving graph image:', error));
    }
  };

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (tabValue === "2") { // Corresponds to the "Graph View" tab
      axios.get('http://localhost:3001/history') // Adjust the URL based on your actual endpoint
        .then(response => {
          setHistoricalData(response.data);
        })
        .catch(error => console.error('There was an error fetching the history:', error));
    }
    axios.get('http://localhost:3001/foods')
      .then(response => setFoods(response.data))
      .catch(error => console.error('There was an error!', error));
  }, [tabValue]);

  const handleAddFood = () => {
    if (selectedFood && gramAmount) {
      setFoodList([...foodList, { name: selectedFood.name, grams: gramAmount }]);
      setSelectedFood(null);
      setGramAmount('');
      setAutocompleteKey(prevKey => prevKey + 1); // Update the key to reset the Autocomplete
    }
  };

  const calculateCarbonFootprint = () => {
    // Format the selected date as 'YYYY-MM-DD' (modify this part according to your actual date handling logic)
    const formattedDate = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null;

    // Ensure you don't proceed if the date is null or improperly formatted
    if (!formattedDate) {
      alert("Please select a valid date.");
      return;
    }

    // Assuming `foodList` is your array of foods to send
    const payload = {
      items: foodList,
      date: formattedDate, // Include the formatted date in the payload
    };
    axios.post('http://localhost:3001/calculate', payload)
    .then(response => {
      // Handle success
      setCarbonFootprint(response.data.totalCarbonFootprint)

      // Reset the form and selected date after submission
      setFoodList([]); // Clears the list of foods
      setSelectedDate(null); // Resets the selected date
      setGramAmount(''); // Clears the gram amount input
      setSelectedFood(null); // Clears the selected food
      setAutocompleteKey(prevKey => prevKey + 1); // Resets the Autocomplete component
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        <TabContext value={tabValue}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Food Input" value="1" {...a11yProps(0)} />
              <Tab label="Graph View" value="2" {...a11yProps(1)} />
              <Tab label="News" value="3" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel value="1">
            <div style={{ margin: '20px' }}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newValue) => {
                  setSelectedDate(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
              <Autocomplete
                key={autocompleteKey} // Use the key here to reset the component
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
          </TabPanel>
          <TabPanel value="2">
            {historicalData.length > 0 ? (
              <Line
                ref={chartRef}
                data={{
                  labels: historicalData.map(data => data.date),
                  datasets: [{
                    label: 'Carbon Footprint',
                    data: historicalData.map(data => data.carbon_footprint),
                    fill: false,
                    backgroundColor: 'rgb(75, 192, 192)',
                    borderColor: 'rgba(75, 192, 192, 0.2)',
                  }],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            ) : (
              <p>No data available</p>
            )}
            <Button
              variant="contained" // Solid background color
              color="primary" // Use the theme's primary color
              onClick={handleSaveChartImage}
              startIcon={<AddCircleOutlineIcon />} // Add an icon (import necessary)
            >
              Save Chart Image
            </Button>
          </TabPanel>
          <TabPanel value="3">
            {/* Placeholder for News */}
            News - In Development
          </TabPanel>
        </TabContext>
      </Box>
    </LocalizationProvider>
  );

}

export default App;
