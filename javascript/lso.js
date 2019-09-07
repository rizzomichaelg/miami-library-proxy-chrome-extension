var optAutoRedirect;
var optUsageOptOut;
var onNetwork;

function parseLocalStorage() {
    optAutoRedirect = JSON.parse(localStorage.autoRedirect || true);
    optUsageOptOut = JSON.parse(localStorage.usageOptOut || false);
    onNetwork = JSON.parse(localStorage.onNetwork || false);
}
