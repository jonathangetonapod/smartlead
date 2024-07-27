const axios = require('axios');
const express = require('express');
const app = express();

app.use(express.json());

const API_KEY = '77e9e37e-4a6f-46d3-8301-e21e4f78ef01_72s72ve'; // Hardcoded API key

app.post('/create-campaign', async (req, res) => {
    const { name } = req.body;

    if (!API_KEY) {
        return res.send('Error: API key is required.');
    }

    try {
        const response = await axios.post('https://server.smartlead.ai/api/v1/campaigns/create', {
            name: name
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        console.log("Request Headers:", response.config.headers); // Log headers for debugging
        res.send(`Campaign created successfully: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.log("Error Response:", error.response ? error.response.data : "No response data");
        if (error.response) {
            res.send(`Error creating campaign: ${error.response.data.message || error.response.data}`);
        } else if (error.request) {
            res.send('Error creating campaign: No response received from the server');
        } else {
            res.send(`Error creating campaign: ${error.message}`);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});