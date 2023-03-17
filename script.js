function sendCurlRequest() {
    const apiUrl = 'https://openai.lan-qian.top/';
    const apiKey = document.getElementById('apiKeyInput').value;
    const url = `${apiUrl}/dashboard/billing/credit_grants`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    };
    fetch(url, options)
        .then(response => response.json())
        .then(responseJson => displayResult(responseJson))
        .catch(error => console.error(error));
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
