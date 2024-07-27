const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Hardcoded API key and email account IDs
const API_KEY = '77e9e37e-4a6f-46d3-8301-e21e4f78ef01_72s72ve';
const EMAIL_ACCOUNT_IDS = [
    // Add your email account IDs here
    2086964, 2086965, 2086966, 2086967, 2086968, 2086969, 2086970, 2086971,
    // ... other IDs
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
        const createResponse = await axios.post(`https://server.smartlead.ai/api/v1/campaigns/create?api_key=${API_KEY}`, {
            name: name
        });

        const campaignId = createResponse.data.id; // Adjust according to actual response structure

        res.json({ campaign_id: campaignId });
    } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).send(`Error: ${error.response?.data?.message || error.message}`);
    }
});

// Handle POST request to add email accounts to the campaign
app.post('/add-email-accounts', async (req, res) => {
    const { campaign_id } = req.body;

    try {
        await axios.post(`https://server.smartlead.ai/api/v1/campaigns/${campaign_id}/email-accounts?api_key=${API_KEY}`, {
            email_account_ids: EMAIL_ACCOUNT_IDS
        });

        res.send(`Email accounts added to campaign ID: ${campaign_id}`);
    } catch (error) {
        console.error("Error adding email accounts:", error);
        res.status(500).send(`Error: ${error.response?.data?.message || error.message}`);
    }
});

// Handle POST request to schedule the campaign
app.post('/schedule-campaign', async (req, res) => {
    const { campaign_id } = req.body;

    const SCHEDULE_CONFIG = {
        timezone: "America/Los_Angeles",
        days_of_the_week: [1, 2, 3, 4, 5],
        start_hour: "09:00",
        end_hour: "17:00",
        min_time_btw_emails: 7,
        max_new_leads_per_day: 1000,
        schedule_start_time: getTodayISO()
    };

    try {
        await axios.post(`https://server.smartlead.ai/api/v1/campaigns/${campaign_id}/schedule?api_key=${API_KEY}`, SCHEDULE_CONFIG);

        const webhookName = `GOAP_${generateRandomNumber()}`;
        const webhookConfig = {
            id: null,
            name: webhookName,
            webhook_url: "https://webhook.site/8222f684-0cf6-43ac-9360-28227fc36d32",
            event_types: ["LEAD_CATEGORY_UPDATED"],
            categories: ["Interested"]
        };

        await axios.post(`https://server.smartlead.ai/api/v1/campaigns/${campaign_id}/webhooks?api_key=${API_KEY}`, webhookConfig);

        res.json({ campaign_id: campaign_id, webhook_name: webhookName });
    } catch (error) {
        console.error("Error scheduling campaign:", error);
        res.status(500).send(`Error: ${error.response?.data?.message || error.message}`);
    }
});

// Serve the index.html as the default page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
