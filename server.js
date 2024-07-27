const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Hardcoded API key
const API_KEY = '77e9e37e-4a6f-46d3-8301-e21e4f78ef01_72s72ve'; 

// Handle POST request from the form
app.post('/create-campaign', async (req, res) => {
    const { name } = req.body;

    if (!API_KEY) {
        return res.send('Error: API key is required.');
    }

    try {
        const response = await axios.post(`https://server.smartlead.ai/api/v1/campaigns/create?api_key=${API_KEY}`, {
            name: name
        });

        res.send(`Campaign created successfully: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.error("Error:", error); // Log the complete error for debugging

        if (error.response) {
            res.send(`Error creating campaign: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            res.send('Error creating campaign: No response received from the server');
        } else {
            res.send(`Error creating campaign: ${error.message}`);
        }
    }
});

// Serve the index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});