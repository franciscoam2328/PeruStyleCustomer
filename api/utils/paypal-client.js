const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID || 'AT5cy3xCNp7j4EV2v4esQhHnxg8BIcjkcvVBGfXESOoxKI8UeB0dHd6p4XUAxo2gJ9Ns7jpNzpSOZrCB';
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EHAU8eieGO_5VUpGm-4aP0i5lkpN_6mdkRbMvhyY7EKuExE5Xt4UhmShXO3VKqpgdHLaY1x7g8dSp1kY';

    if (process.env.NODE_ENV === 'production') {
        return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
    }
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
