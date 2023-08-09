const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const prefix = "/fakeopen";
    if (!req.url.startsWith(prefix)) {
        return;
    }
    const targetUrl = "https://ai.fakeopen.com" + req.url.substring(prefix.length);

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: req.headers,
            body: req.body
        });

        const data = await response.text();

        res.status(response.status);
        res.setHeader('Content-Type', response.headers.get('content-type'));
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
