const resultTable = document.getElementById("resultTable");


function sendCurlRequests() {
    while (resultTable.rows.length > 1) {
        resultTable.deleteRow(1);
    }
    const apiUrl = document.getElementById("apiUrlInput").value;
    const text = document.getElementById("apiKeyInput").value;
    const apiKeys = text.match(/sk-[A-Za-z0-9]{10,48}/g);
    apiKeys.forEach((apiKey, index) => {
        const row = resultTable.insertRow(-1);
        sendCurlRequest(apiUrl, apiKey.trim(), index+1);
        const showFullApiKey = document.getElementById("showFullApiKey").checked;
        if (!showFullApiKey) {
            apiKey = apiKey.slice(0, 6) + '****' + apiKey.slice(-6);
        }
        for(let i = 0; i < 7; i++){  // 修改为7个单元格
            const cell = row.insertCell(-1);
            cell.innerText = i === 0 ? apiKey : '查询中...';
        }
    });
}

function getDateRange() {
    const currentDate = new Date();
    const startDate = new Date();
    const endDate = new Date();

    startDate.setDate(currentDate.getDate() - 99);
    endDate.setDate(currentDate.getDate() + 1);

    const start_date = startDate.toISOString().slice(0, 10);
    const end_date = endDate.toISOString().slice(0, 10);

    return `?end_date=${end_date}&start_date=${start_date}`;
}

function sendCurlRequest(apiUrl, apiKey, rowIndex) {
    const data = getDateRange();
    const usage = `${apiUrl}/dashboard/billing/usage${data}`;
    const subscription = `${apiUrl}/dashboard/billing/subscription`;
    const modelsUrl = `${apiUrl}/v1/models`;

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

    const request3 = fetch(modelsUrl, options)
        .then(response => response.json());

    Promise.all([request1, request2, request3])
        .then(([json_data1, json_data2, json_data3]) => {
            displayResult(rowIndex, apiKey, json_data1, json_data2, json_data3);
        })
        .catch(error => {
            displayError(rowIndex, error);
        });
}

function displayResult(rowIndex, apiKey, usage, subscription, models) {
    const row = resultTable.rows[rowIndex];
    const totalUsed = (usage.total_usage / 100).toFixed(4);
    const total = subscription.hard_limit_usd.toFixed(4);
    const totalAvailable = (total - totalUsed).toFixed(4);
    const expiresAt = formatDate(subscription.access_until);
    const hasPaymentMethod = subscription.has_payment_method ? '是' : '否'; // 新的数据
    const showFullApiKey = document.getElementById("showFullApiKey").checked;
    let availableModel = 'GPT3.5';
    models.data.forEach((model) => {
        if (model.id.includes('gpt-4')) {
            availableModel = 'GPT4';
        }
    });
    if (!showFullApiKey) {
        apiKey = apiKey.slice(0, 6) + '****' + apiKey.slice(-6);
    }
    [apiKey, total, totalUsed, totalAvailable, expiresAt, hasPaymentMethod, availableModel].forEach((text, index) => {
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

