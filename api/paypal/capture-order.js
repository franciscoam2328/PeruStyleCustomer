const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('../utils/paypal-client');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client().execute(request);
        // Here you would typically update your database (Supabase) to mark the order/subscription as paid
        // e.g., await supabase.from('orders').update({ status: 'paid' }).eq('paypal_order_id', orderID);

        res.status(200).json({ status: 'success', capture: capture.result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
