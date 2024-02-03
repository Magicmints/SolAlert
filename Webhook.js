
const createWebhook = async () => {
    try {
        const apiKey = process.env.key; // Replace with your API key
        const webhookUrl = process.env.url;
        const walletAddress = 'FQuxesCpn3gikaxmwFr98ee9F8MSChUziyVKLYYrFKmW'; // Replace with the wallet address

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
        console.error("error", e);
    }
};

createWebhook();
