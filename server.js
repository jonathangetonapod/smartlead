const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/create-campaign', async (req, res) => {
    const { name, client_id } = req.body;
    const api_key = process.env.API_KEY; // Ensure you have your API key set in your environment variables

    try {
        const response = await axios.post('https://server.smartlead.ai/api/v1/campaigns/create', {
            name: name,
            client_id: client_id || null
        }, {
            headers: {
                'Authorization': `Bearer ${api_key}`
            }
        });

        res.send(`Campaign created successfully: ${JSON.stringify(response.data)}`);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            res.send(`Error creating campaign: ${error.response.data.message || error.response.data}`);
        } else if (error.request) {
            // The request was made but no response was received
            res.send('Error creating campaign: No response received from the server');
        } else {
            // Something happened in setting up the request that triggered an Error
            res.send(`Error creating campaign: ${error.message}`);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});