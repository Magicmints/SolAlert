// Replace 'YOUR_BOT_TOKEN' with the actual API token obtained from BotFather.
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

// Replace 'YOUR_BOT_TOKEN' with the actual API token obtained from BotFather.
// Replace with your Telegram bot token
const botToken = process.env.token;

// Create an instance of the Telegram bot.
const bot = new TelegramBot(botToken, { polling: true });

// Define a variable to store user data (wallet and email).
let userData = {};

// Replace 'YOUR_API_KEY' with your Helius API key.
const apiKey = process.env.key;

// Function to create a Helius webhook.
const createHeliusWebhook = async (walletAddress) => {
    try {
        const webhookUrl = 'http://52.90.255.63:3000/helius-webhook'; // Replace with your webhook URL
        const requestBody = {
            webhookURL: webhookUrl,
            transactionTypes: ['Any'], // You can specify specific transaction types if needed
            accountAddresses: [walletAddress],
            webhookType: 'enhanced', // Use 'enhanced' for enhanced transactions
            authHeader: '',

        };

        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('Created Helius webhook:', data);
    } catch (e) {
        console.error("Error creating Helius webhook", e);
    }
};

const editHeliusWebhook = async (walletAddress) => {
    try {
        const apiKey = process.env.key; // Replace with your Helius API key
        const webhookUrl = 'http://52.90.255.63:3000/helius-webhook';// Replace with your webhook URL

        const requestBody = {
            webhookURL: webhookUrl,
            transactionTypes: ['Any'], // You can specify specific transaction types if needed
            accountAddresses: [walletAddress],
            webhookType: 'enhanced', // Use 'enhanced' for enhanced transactions
            authHeader: '', // Optional: If you have an auth header, provide it here
        };

        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log({ data });
    } catch (e) {
        console.error("Error editing Helius webhook:", e);
    }
};

// Define a function to handle the /start command.
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Check if the user is already registered.
    if (userData[chatId]) {
        bot.sendMessage(chatId, 'You are already registered.');
    } else {
        bot.sendMessage(chatId, 'Welcome to the Solana Transaction Tracker Bot! Please enter your Solana wallet address:');
        // Set the state to 'waitingForWallet' to track the user's input.
        userData[chatId] = { state: 'waitingForWallet' };
    }
});

// Listen for incoming messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (userData[chatId]) {
        const state = userData[chatId].state;

        if (state === 'waitingForWallet') {
            // Store the user's wallet address.
            userData[chatId].wallet = messageText;
            userData[chatId].state = 'waitingForEmail';
            bot.sendMessage(chatId, 'Thank you! Please enter your email address for notifications:');
        } else if (state === 'waitingForEmail') {
            // Store the user's email address.
            userData[chatId].email = messageText;
            userData[chatId].state = 'completed';
            bot.sendMessage(chatId, 'You are now registered! You will receive notifications for Solana transactions to your email address.');

            // Save the user data to a JSON file (you can replace this with your preferred storage method).
            fs.writeFileSync('user-data.json', JSON.stringify(userData, null, 4));

            // Create a Helius webhook for the user's wallet address.
            editHeliusWebhook(userData[chatId].wallet);
        }
    }
});

console.log('Bot is running...');
