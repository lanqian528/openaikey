const resultSection = document.getElementById("resultSection");
const errorSection = document.getElementById("errorSection");
let timeoutId;

function sendCurlRequest() {
    const apiUrl = document.getElementById("apiUrlInput").value;
    const apiKey = document.getElementById("apiKeyInput").value;
    const data = `?end_date=2023-05-01&start_date=2023-02-01`;
    const usage = `${apiUrl}/dashboard/billing/usage${data}`;
    const subscription = `${apiUrl}/dashboard/billing/subscription`;


    if (!apiUrl) {
        alert("请设置API链接");
        return;
    }
    if (!apiKey) {
        alert("请填写API KEY");
        return;
    }
    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        }
    };

    timeoutId = setTimeout(() => {
        displayError(new Error("API链接无响应，请检查其有效性或网络情况"));
    }, 5000);

    const request1 = fetch(usage, options)
        .then(response => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                return response.json().then((error) => {
                    displayError(error.error);
                });
            }
            return response.json();
        });
    const request2 = fetch(subscription, options)
        .then(response => response.json());
    Promise.all([request1, request2])
        .then(([json_data1, json_data2]) => {
            displayResult(json_data1, json_data2);
        });
 }

function displayResult(usage, subscription) {
    const totalGrantedElement = document.getElementById('totalGranted');
    const totalUsedElement = document.getElementById('totalUsed');
    const totalAvailableElement = document.getElementById('totalAvailable');
    // const effectiveAtElement = document.getElementById('effectiveAt');
    // const expiresAtElement = document.getElementById('expiresAt');
    const totalUsed = (usage.total_usage / 100).toFixed(4);
    const total = subscription.hard_limit_usd.toFixed(4);
    totalGrantedElement.innerText = total;
    totalUsedElement.innerText = totalUsed;
    totalAvailableElement.innerText = (total - totalUsed).toFixed(4);
    // effectiveAtElement.innerText = formatDate(result.grants.data[0].effective_at);
    // expiresAtElement.innerText = formatDate(result.grants.data[0].expires_at);

    resultSection.style.display = 'block';
    errorSection.style.display = "none";
}

function displayError(error) {
    clearTimeout(timeoutId);
    const errorMessageElement = document.getElementById("errorMessage");
    if (error.name === "AbortError") {
        errorMessageElement.innerText =
            "API链接无响应，请检查其有效性或网络情况";
    } else if (error.message.includes("Incorrect API key provided")) {
        errorMessageElement.innerText = "请检查API-KEY是否正确";
    }else if (error.message.includes("This key is")) {
        errorMessageElement.innerText = "您的openai账号已被封禁";
    } else {
        errorMessageElement.innerText =
            "API链接无响应，请检查其有效性或网络情况";
    }

    resultSection.style.display = "none";
    errorSection.style.display = "block";
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = addLeadingZero(date.getMonth() + 1);
    const day = addLeadingZero(date.getDate());
    return `${year}-${month}-${day}`;
}

function addLeadingZero(number) {
    return number < 10 ? '0' + number : number;
}
