const request = require('request');

module.exports = (req, res) => {
    // proxy middleware options
    let prefix = "/fakeopen"
    if (!req.url.startsWith(prefix)) {
        return;
    }
    let target = "https://ai.fakeopen.com" + req.url.substring(prefix.length);

    var options = {
        url: target,
        method: req.method,
        headers: req.headers,
        body: req.body
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(response.body);
        res.end();
    });
}
