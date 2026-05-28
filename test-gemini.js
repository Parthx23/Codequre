const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
    try {
        const axios = require('axios');
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        console.log("Available models:", response.data.models.map(m => m.name));
    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.data : error.message);
    }
}
test();
