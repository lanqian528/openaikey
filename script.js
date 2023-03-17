const resultSection = document.getElementById("resultSection");
const errorSection = document.getElementById("errorSection");
let timeoutId;

function sendCurlRequest() {
    const apiUrlSelect = document.getElementById("apiUrlInput");
    const apiUrl =
        apiUrlSelect.value === "custom" ? apiUrlCustom : apiUrlSelect.value;
    const apiKey = document.getElementById("apiKeyInput").value;
    const url = `${apiUrl}/dashboard/billing/credit_grants`;

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
            Authorization: `Bearer ${apiKey}`
        }
    };

    timeoutId = setTimeout(() => {
        displayError(new Error("API链接无响应，请检查其有效性或网络情况"));
    }, 5000);

    fetch(url, options)
        .then((response) => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                return response.json().then((error) => {
                    displayError(error.error);
                });
            }
            return response.json();
        })
        .then((responseJson) => displayResult(responseJson))
}

function displayResult(result) {
    const totalGrantedElement = document.getElementById('totalGranted');
    const totalUsedElement = document.getElementById('totalUsed');
    const totalAvailableElement = document.getElementById('totalAvailable');
    const effectiveAtElement = document.getElementById('effectiveAt');
    const expiresAtElement = document.getElementById('expiresAt');
    totalGrantedElement.innerText = result.total_granted;
    totalUsedElement.innerText = result.total_used;
    totalAvailableElement.innerText = result.total_available;
    effectiveAtElement.innerText = formatDate(result.grants.data[0].effective_at);
    expiresAtElement.innerText = formatDate(result.grants.data[0].expires_at);

    const resultSection = document.getElementById('resultSection');
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
    console.log("111")
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
