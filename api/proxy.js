// const request = require('request');
//
// module.exports = (req, res) => {
//     // proxy middleware options
//     let prefix = "/fakeopen"
//     if (!req.url.startsWith(prefix)) {
//         return;
//     }
//     let target = "https://ai.fakeopen.com" + req.url.substring(prefix.length);
//
//     var options = {
//         url: target,
//         method: req.method,
//         headers: req.headers,
//         body: req.body
//     };
//     request(options, function (error, response) {
//         if (error) throw new Error(error);
//         res.writeHead(200, {"Content-Type": "application/json"});
//         res.write(response.body);
//         res.end();
//     });
// }
const axios = require('axios');

module.exports = async (req, res) => {
    const prefix = "/fakeopen";
    if (!req.url.startsWith(prefix)) {
        return;
    }
    const targetUrl = "https://ai.fakeopen.com" + req.url.substring(prefix.length);

    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: req.headers,
            data: req.body,
        });

        res.status(response.status);
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

