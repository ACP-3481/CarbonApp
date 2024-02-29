import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box, Tab, Tabs, TextField, Button, List, ListItem, ListItemText, Autocomplete } from '@mui/material';
import { TabPanel, TabContext } from '@mui/lab';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // For Chart.js v3 or newer
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';

function TitleBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="secondary">
              <Toolbar>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  CarbonApp
                </Typography>
                <Button color="inherit">Login</Button>
              </Toolbar>
            </AppBar>
          </Box>
    )
}

export default TitleBar;