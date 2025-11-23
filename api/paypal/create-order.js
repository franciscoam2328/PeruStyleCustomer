const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('../utils/paypal-client');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { plan, price } = req.body; // Expecting plan details or price

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: price || '10.00' // Default or dynamic price
            },
            description: `Plan Subscription: ${plan}`
        }]
    });

    try {
        const order = await client().execute(request);
        res.status(200).json({ id: order.result.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
