/**
 * Core Application Backend - B2B WhatsApp Automation & ERP Middleware
 * Sanitized version for public repository review.
 */

const express = require('express');
const http = require('http');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// Configuration loading with fallback defaults
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config = {
    port: 3000,
    environment: 'production'
};

if (fs.existsSync(CONFIG_PATH)) {
    try {
        const rawData = fs.readFileSync(CONFIG_PATH);
        config = JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading configuration file:', error.message);
    }
}

const app = express();
app.use(express.json());

const server = http.createServer(app);

// Initialize WhatsApp Client with local session authentication
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'b2b-session' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR Code received. Scan please.');
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready and connected!');
});

client.on('message', async (message) => {
    try {
        // Handle incoming business messages and automated flows
        if (message.body.startsWith('!status')) {
            await message.reply('System operational. B2B Middleware active.');
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// REST API Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'B2B WhatsApp ERP Middleware',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || config.port || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

client.initialize();