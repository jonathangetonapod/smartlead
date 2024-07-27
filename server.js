const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Hardcoded API key and email account IDs
const API_KEY = '77e9e37e-4a6f-46d3-8301-e21e4f78ef01_72s72ve';
const EMAIL_ACCOUNT_IDS = [
    2086964, 2086965, 2086966, 2086967, 2086968, 2086969, 2086970, 2086971,
    2086972, 2086973, 2086974, 2086975, 2086976, 2086977, 2086978, 2086979,
    2086980, 2086981, 2086983, 2086984, 2086985, 2086986, 2086987, 2086988,
    2086989, 2086990, 2086991, 2086992, 2086993, 2086994, 2086996, 2086997,
    2086998, 2086999, 2087000, 2087001, 2087002, 2087003, 2087004, 2087005,
    2087006, 2087007, 2087008, 2087009, 2087011, 2087012, 2087013, 2087014,
    2087015, 2087016, 2087017, 2087018, 2087019, 2087020, 2087021, 1389881,
    1389882, 1389883, 1389884, 1389885, 1389887, 1389888, 1389889, 1389890,
    1389891, 1389892, 1389893, 1389894, 1389895, 1389896, 1389897, 1389898,
    1389899, 1389900, 1389901, 1389902, 1389903, 1389904, 1389905, 1389906,
    1389907, 1389908, 1389909, 1389910, 1389911, 1389912, 1389913, 1389914,
    1389915, 1389916, 1389917, 1389918, 1389920, 1389921, 1389922, 1389923,
    1389924, 1389930, 1389931, 1389932, 1389933, 1389934, 1389935, 1450496,
    1450497, 1450499, 1450500, 1450501, 1450502, 1450503, 1450505, 1450506
];

// Function to get today's date in ISO format
const getTodayISO = () => {
    return new Date().toISOString();
};

// Function to generate a random number for the webhook name
const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10000);
};

// Handle POST request to create a campaign
app.post('/create-campaign', async (req, res) => {
    const { name } = req.body;

    if (!API_KEY) {
        return res.status(400).send('Error: API key is required.');
    }

    try {
        // Create the campaign
        const createResponse = await axios.post(`https://server.smartlead.ai/api/v1/campaigns/create?api_key=${API_KEY}`, {
            name: name
        });

        const campaignId = createResponse.data.id; // Adjust according to actual response structure

        res.json({ campaign_id: campaignId });
    } catch (error) {
        console.error("Error creating campaign:", error); // Log the complete error for debugging

        if (error.response) {
            res.status(500).send(`Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            res.status(500).send('Error: No response received from the server');
        } else {
            res.status(500).send(`Error: ${error.message}`);
        }
    }
});

// Handle POST request to add email accounts to the campaign
app.post('/add-email-accounts', async (req, res) => {
    const { campaign_id } = req.body;

    try {
        // Add email account IDs to the created campaign
        await axios.post(`https://server.smartlead.ai/api/v1/campaigns/${campaign_id}/email-accounts?api_key=${API_KEY}`, {
            email_account_ids: EMAIL_ACCOUNT_IDS
        });

        res.send(`Email accounts added to campaign ID: ${campaign_id}`);
    } catch (error) {
        console.error("Error adding email accounts:", error); // Log the complete error for debugging

        if (error.response) {
            res.status(500).send(`Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            res.status(500).send('Error: No response received from the server');
        } else {
            res.status(500).send(`Error: ${error.message}`);
        }
    }
});

// Handle POST request to schedule the campaign
app.post('/schedule-campaign', async (req, res) => {
    const { campaign_id } = req.body;

    // Scheduling configuration
    const SCHEDULE_CONFIG = {
        timezone: "America/Los_Angeles",
        days_of_the_week: [1, 2, 3, 4, 5], // Monday to Friday
        start_hour: "09:00", // 9 AM
        end_hour: "17:00", // 5 PM
        min_time_btw_emails: 7,
        max_new_leads_per_day: 1000,
        schedule_start_time: getTodayISO()
    };

    try {
        // Schedule the campaign
        await axios.post(`https://server.smartlead.ai/api/v1/campaigns/${campaign_id}/schedule?api_key=${API_KEY}`, SCHEDULE_CONFIG);

        // Create the webhook
        const webhookName = `GOAP_${generateRandomNumber()}`;
        const webhookConfig = {
            id: null, // Set to null to create a new webhook
            name: webhookName,
            webhook_url: "https://webhook.site/8222f684-0cf6-43ac-9360-28227fc36d32",
            event_types: ["LEAD_CATEGORY_UPDATED"],
            categories: ["Interested"]
        };

        await axios.post(`https://server.smartlead.ai/api/v1/campaigns/${campaign_id}/webhooks?api_key=${API_KEY}`, webhookConfig);

        res.json({ campaign_id: campaign_id, webhook_name: webhookName });
    } catch (error) {
        console.error("Error scheduling campaign:", error); // Log the complete error for debugging

        if (error.response) {
            res.status(500).send(`Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            res.status(500).send('Error: No response received from the server');
        } else {
            res.status(500).send(`Error: ${error.message}`);
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
