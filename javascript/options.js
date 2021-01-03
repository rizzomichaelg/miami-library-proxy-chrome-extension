/**
 * Derived from the Google Calendar Checker available at:
 * http://code.google.com/chrome/extensions/samples.html
 *
 * Licensed under the Google 3-Clause BSD:
 * http://code.google.com/google_bsd_license.html
 */

function $(id) {
    return document.getElementById(id);
}

//adding listener when body is loaded to call init function.
window.addEventListener('load', init, false);

function updateStatusBar() {
    // Update the status bar with the current network
    chrome.extension.sendRequest({operation: "getstate"}, function(response) {
        if (response.networkTag == "OFF") {
            $('statusBar').innerText = '(Current network: Off-Campus';
            $('statusBar').innerHTML += ' - <a href="#" id="redetect" style="color:#888">Redetect Now</a> )';
        } else {
            $('statusBar').innerText = '(Current network: ' + response.networkTag;
            $('statusBar').innerHTML += ' - <a href="#" id="redetect" style="color:#888">Redetect Now</a> )';
        }
	document.getElementById('redetect').addEventListener('click', function(){
		detectNow();
	    }, false);

    });
}

// Set values based on localStorage
function init() {
    parseLocalStorage();
    $('autoRedirect').checked = optAutoRedirect;
    $('usageOptOut').checked = optUsageOptOut;
    // Show user their detected network
    updateStatusBar();
}

function detectNow() {
    // Redetect network
    chrome.extension.sendRequest({operation: "redetect"}, function(response) {});
    // The network state request is async, and sometimes returns in a few seconds.
    // TODO: Clean this up by making the request optionally synchronous.
    updateStatusBar();
    setTimeout(function(){ updateStatusBar(); }, 1000);
    setTimeout(function(){ updateStatusBar(); }, 2000);
    setTimeout(function(){ updateStatusBar(); }, 3000);
    setTimeout(function(){ updateStatusBar(); }, 5000);
}

/**
 * Saves the value of the checkbox into local storage.
 */
function save() {
    localStorage.autoRedirect = $('autoRedirect').checked;
    localStorage.usageOptOut = $('usageOptOut').checked;
    // Make sure the background page sees the changes!
    chrome.extension.getBackgroundPage().parseLocalStorage();
    $('autoRedirectStatus').innerHTML = 'Saved.';
    $('autoRedirectStatus').style.display = 'block';
    setTimeout(function(){ $('autoRedirectStatus').style.display = 'none' }, 1500);
}

/**
 * Add button listeners for Chrome Extension Manifest v2
 */

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
	var buttons = document.getElementsByTagName('input');
	for (var i = 0; i < buttons.length; i++) {
	    buttons[i].addEventListener('click', function(){
		    save();
		}, false);
	}
    }
}
