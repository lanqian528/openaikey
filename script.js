const resultTable = document.getElementById("resultTable");

function sendCurlRequests() {
    const apiUrl = document.getElementById("apiUrlInput").value;
    const apiKeys = document.getElementById("apiKeyInput").value.split('\n');
    if (!/^sk-.*/.test(apiKeys[apiKeys.length - 1].trim())) {
        apiKeys.pop();
    }
    apiKeys.forEach((apiKey, index) => {
        // 创建新行并预填充数据
        const row = resultTable.insertRow(-1);
        for(let i = 0; i < 5; i++){
            const cell = row.insertCell(-1);
            cell.innerText = i === 0 ? apiKey : '查询中...';
        }
        sendCurlRequest(apiUrl, apiKey.trim(), index+1);
    });
}

function sendCurlRequest(apiUrl, apiKey, rowIndex) {
    const data = `?end_date=2023-06-01&start_date=2023-04-01`;
    const usage = `${apiUrl}/dashboard/billing/usage${data}`;
    const subscription = `${apiUrl}/dashboard/billing/subscription`;

    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        }
    };

    const request1 = fetch(usage, options)
        .then(response => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(error.error.message);
                });
            }
            return response.json();
        });
    const request2 = fetch(subscription, options)
        .then(response => response.json());
    Promise.all([request1, request2])
        .then(([json_data1, json_data2]) => {
            displayResult(rowIndex, apiKey, json_data1, json_data2);
        })
        .catch(error => {
            displayError(rowIndex, error);
        });
}

function displayResult(rowIndex, apiKey, usage, subscription) {
    const row = resultTable.rows[rowIndex];
    const totalUsed = (usage.total_usage / 100).toFixed(4);
    const total = subscription.hard_limit_usd.toFixed(4);
    const totalAvailable = (total - totalUsed).toFixed(4);
    const expiresAt = formatDate(subscription.access_until);

    [apiKey, total, totalUsed, totalAvailable, expiresAt].forEach((text, index) => {
        row.cells[index].innerText = text;
    });
}

function displayError(rowIndex, error) {
    const row = resultTable.rows[rowIndex];
    const apiKey = row.cells[0].innerText;
    let errorMessage = "";

    if (error.name === "AbortError") {
        errorMessage = "API链接无响应，请检查其有效性或网络情况然后重试";
    } else if (error.message.includes("Incorrect API key provided")) {
        errorMessage = "请检查API-KEY是否正确";
    }else if (error.message.includes("This key is")) {
        errorMessage = "该openai账号已被封禁";
    } else {
        errorMessage = "API链接无响应，请检查其有效性或网络情况";
    }

    row.cells[0].innerText = apiKey;
    row.cells[1].innerText = errorMessage;
    for (let i = 2; i < row.cells.length; i++) {
        row.cells[i].innerText = "";
    }
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

