const resultTable = document.getElementById("resultTable");

const cells_num = 7;

function sendCurlRequests() {
    while (resultTable.rows.length > 1) {
        resultTable.deleteRow(1);
    }
    const apiUrl = document.getElementById("apiUrlInput").value;
    const text = document.getElementById("apiKeyInput").value;
    const apiKeys = text.match(/(sk-[A-Za-z0-9]{48}|sess-[A-Za-z0-9]{40})/g);
    apiKeys.forEach((apiKey, index) => {
        const row = resultTable.insertRow(-1);
        sendCurlRequest(apiUrl, apiKey.trim(), index+1);
        const showFullApiKey = document.getElementById("showFullApiKey").checked;
        if (!showFullApiKey) {
            apiKey = apiKey.slice(0, 8) + '****' + apiKey.slice(-6);
        }
        for (let i = 0; i < cells_num; i++) {
            let cell = row.insertCell(-1);
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
    const hasPaymentMethod = subscription.has_payment_method ? '✔️' : '❌'; // 新的数据
    const showFullApiKey = document.getElementById("showFullApiKey").checked;
    let availableModel = '❌';
    models.data.forEach((model) => {
        if (model.id.includes('gpt-4')) {
            availableModel = '✔️';
        }
    });
    if (!showFullApiKey) {
        apiKey = apiKey.slice(0, 8) + '****' + apiKey.slice(-6);
    }
    [apiKey, total, totalUsed, totalAvailable, expiresAt, hasPaymentMethod, availableModel].forEach((text, index) => {
        row.cells[index].innerText = text;
    });
}

function displayError(rowIndex, error) {
    const row = resultTable.rows[rowIndex];
    const apiKey = row.cells[0].innerText;

    if (error.message.includes("must be made with a session key")) {
        errorMessage = "✔️";
    } else if (error.message.includes("Incorrect API key provided")) {
        errorMessage = "api-key错误，请检查其有效性";
    } else if (error.message.includes("This key is")) {
        errorMessage = "该openai账号已被封禁";
    } else {
        errorMessage = "api请求无响应，请检查其有效性或网络情况";
    }

    row.cells[0].innerText = apiKey;
    row.cells[1].innerText = errorMessage;
    for (let i = 2; i < row.cells.length; i++) {
        if(row.cells[i].innerText === "查询中..."){
            row.cells[i].innerText = "";
        }
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

