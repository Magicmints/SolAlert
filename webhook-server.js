const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Import the nodemailer library
require('dotenv').config();
const app = express();
const port = 3000; // Set your desired port number

// Use body-parser to parse incoming JSON dataa
app.use(bodyParser.json());

// Define a route for the Helius webhook
app.post('/helius-webhook', (req, res) => {
    const webhookData = req.body; // Contains the data sent by Helius

    // Process the webhook data here (e.g., store it in a database, send notifications)
    console.log('Received Helius Webhook Data:', webhookData);

    // Format the email content based on webhook data
    const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            .header {
                background-color: #007bff;
                color: #fff;
                padding: 20px;
                text-align: center;
            }
            .content {
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .transaction-details {
                margin-top: 20px;
            }
            .signature-link {
                text-decoration: none;
                color: #007bff;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Solana Transaction Notification</h2>
            </div>
            <div class="content">
                <p>${webhookData[0].description}</p>
                <div class="transaction-details">
                    <p><strong>Transaction Type:</strong> ${webhookData[0].type}</p>
                    <p><strong>Timestamp:</strong> ${webhookData[0].timestamp}</p>
                    <p><strong>Source:</strong> ${webhookData[0].source}</p>
                    <p><strong>Slot:</strong> ${webhookData[0].slot}</p>
                    <p><strong>Fee:</strong> ${webhookData[0].fee} SOL</p>
                    <p><strong>Transaction Signature:</strong> <a class="signature-link" href="https://solscan.io/tx/${webhookData[0].signature}" target="_blank">${webhookData[0].signature}</a></p>
                </div>
            </div>
        </div>
    </body>
    </html>    
    `;

    // Create a Nodemailer transporter with your email service credentials
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.user, // Your Gmail email address
            pass: process.env.pass, // Your Gmail password
        },
    });

    // Define the email parameters
    const mailOptions = {
        from: process.env.from, // Your Gmail email address
        to: process.env.to, // Recipient's email address
        subject: 'Solana Transaction Notification',
        html: emailContent, // Use the formatted email content here
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email send error:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });

    // Send a response to Helius to confirm receipt
    res.status(200).send('Webhook received successfully');
});

// Start your existing Node.js application
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
