const request = require('request');

module.exports = (req, res) => {
    // proxy middleware options
    let prefix = "/fakeopen";
    if (!req.url.startsWith(prefix)) {
        return;
    }
    let target = "https://ai.fakeopen.com" + req.url.substring(prefix.length);

    var options = {
        'method': req.method,
        'url': target,
        'headers': req.headers
    };
    req.pipe(request(options)).pipe(res);
};
