require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/create-campaign', async (req, res) => {
    const { name, client_id } = req.body;
    const api_key = process.env.API_KEY;

    if (!api_key) {
        return res.send('Error: API key is required.');
    }

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
            res.send(`Error creating campaign: ${error.response.data.message || error.response.data}`);
        } else if (error.request) {
            res.send('Error creating campaign: No response received from the server');
        } else {
            res.send(`Error creating campaign: ${error.message}`);
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});