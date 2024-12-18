/**
 * OpenAI Realtime API Server
 * 
 * This server provides a secure way to obtain ephemeral tokens for the OpenAI Realtime API.
 * It acts as a middleware between the client and OpenAI's API to ensure API keys are not
 * exposed to the client side.
 */

const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Constants
const CONFIG = {
    PORT: process.env.PORT || 3000,
    OPENAI_API_URL: 'https://api.openai.com/v1/realtime/sessions',
    MODEL: 'gpt-4o-realtime-preview-2024-12-17',
    VOICE: 'echo'
};

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required but not set in environment variables');
    process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());

// CORS middleware for development
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

/**
 * Error handler middleware
 */
const errorHandler = (err, _req, res, _next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

/**
 * Route to obtain an ephemeral token from OpenAI
 */
app.get('/session', async (_req, res, next) => {
    try {
        const response = await fetch(CONFIG.OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                voice: CONFIG.VOICE,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', errorText);
            return res.status(response.status).json({
                error: 'Failed to obtain token',
                details: process.env.NODE_ENV === 'development' ? errorText : undefined
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(CONFIG.PORT, () => {
    console.log(`Server is running on http://localhost:${CONFIG.PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 