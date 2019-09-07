// Parse some local storage objects!
// onNetwork now comes from an LSO
parseLocalStorage();

var proxyURL = '.access.library.miami.edu';

// Once per session, append "?holding=wustlmlib" to PubMed.
var rewrotePubMedThisSession = false;

// For debugging & options page
var networkTag = '';

// Set a 15 minute timeout interval to redetect the network status.
// Per poissoncdf(), this is probably friendly. Hell, MSVPN is way more active.
var refreshTimeoutHandle;
var refreshTimeoutMilliseconds = 900000;

// Listener for the options page
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.operation == 'getstate') {
            sendResponse({networkTag: networkTag});
        } else if (request.operation == 'redetect') {
            console.info('Manual network redetection.');
            detectNetworkState();
            sendResponse({networkTag: networkTag});
        } else {
            console.warn('Unknown background listener request.');
            sendResponse({});
        }
    });


var whitelist = {'accessmedicine.com':1,'online.statref.com':1,'uptodate.com':1,'www.accessmedicine.com':1,'www.uptodate.com':1};

// The user wants auto-redirection and is off-network,
// so we perform URL parsing and (maybe) redirection
function checkURLforRedirection(tabId, parsedURL) {
    // First, get out of here if a network has special "whitelisted" journals
    if (whitelist.hasOwnProperty(parsedURL.host)) {
        return false;
    }

    if (journals.hasOwnProperty(parsedURL.host)) {
        doRedirectToProxy(tabId, parsedURL);
        return true;
    }

    return false;
}

// Redirect the page using the auto-determined proxy URL
// Modularize so we only parse the URL once (parsing is expensive!)
function doRedirectToProxy(tabId, parsed, appendString) {
    if (!appendString) {
        appendString = '';
    }
    var proxifiedURL = parsed.protocol + "://" + parsed.host + proxyURL + parsed.relative + appendString;
    try {
        chrome.tabs.update(tabId, {url: proxifiedURL});
    } catch(e) {
        // Pre-rendered magic tab that we can't update.
    }
}

// Send log data if there's a missed URL (someone had to manually click)
// or there's a Becker network detection error.
// function writeToRemoteLog(theData) {
//     var uploader = new XMLHttpRequest();
//     var logString = "url:" + encodeURIComponent(theData) + ",auto:" + optAutoRedirect +
//         ",onNet:" + onNetwork + ",tag:" + networkTag;
//     uploader.open("GET", "https://update.epoxate.com/becker-extension/log.py?" + logString, true);
//     uploader.send();
// }

// Listen for pending URL loads
// WARNING: Pre-rendered tabs from URL prediction (or link hints) cause oddities with onBeforeNavigate,
//          like inaccessible tabs. Be careful here!
function checkNavObject(frameId, tabId, url) {
    // Only listen in the main frame at frameId=0
    // Should we check for redirect loops, like with web.mit.edu?
    // frameId will match "0" for webNavigation object, and "Undefined" for tabs
    if (optAutoRedirect && frameId === 0) {
        var parsedURL = parseUri(url);
        if (parsedURL.host == "www.ncbi.nlm.nih.gov") {
            // Redirect PubMed journals to add ?holding flag.
            // This is useful whether we are on or off network.
            if (!rewrotePubMedThisSession) {
                if (parsedURL.relative == "/pubmed/" || parsedURL.relative == "/pubmed"
                    || parsedURL.relative == "/pmc/" || parsedURL.relative.match(/^\/pubmed\/\d{6,}$/)) {
                    // Redirect with no proxy url, but an appendString
                    doRedirectToProxy(tabId, parsedURL, "?otool=flumrlib");
                    rewrotePubMedThisSession = true;
                    setTimeout(function(){ rewrotePubMedThisSession = false; }, 7200000); // Re-do this every 2 hours.
                }
            }
        }  else if (!onNetwork) {
            checkURLforRedirection(tabId, parsedURL);
        }
    }
}

chrome.webNavigation.onBeforeNavigate.addListener(function(navObject) {
    checkNavObject(navObject.frameId, navObject.tabId, navObject.url); } );
chrome.tabs.onCreated.addListener(function(navObject) {
    checkNavObject(0, navObject.id, navObject.url); } );
// Deal with pre-rendered tabs.
chrome.webNavigation.onTabReplaced.addListener(function(navObject) {
    chrome.tabs.get(navObject.tabId, function(tab) {
        checkNavObject(0, navObject.id, tab.url);
    }); });

// Alert users if they're trying to unnecessarily proxify things.
function showUserHint(warning) {
    chrome.notifications.create(
        'note',
        {   type: 'basic',
            iconUrl: '../images/schollidesign48.png',
            title: 'Unnecessary Click',
            message: warning
        },
        function(noteId) { setTimeout(function(){ chrome.notifications.clear(noteId, function() {}) }, 8000); }
    );
}

// Listen to clicking on our button.
chrome.browserAction.onClicked.addListener(function (tab) {
    // Parse and redirect.
    var parsedURL = parseUri(tab.url);

    // We check for HTTP/HTTPS only (no chrome://), and that "proxy.wustl.edu" isn't at the end of the
    // string, otherwise we're probably already at [becker|lib]proxy.wustl.edu.
    if (parsedURL.protocol == 'http' || parsedURL.protocol == 'https') {
        if (parsedURL.host.substring(parsedURL.host.length - 25) != '.access.library.miami.edu') {
            if (hint_urls.hasOwnProperty(parsedURL.host)) {
                // Warn users if they're doing something unnecessary.
                // In this case, do NOT redirect these URLs.
                showUserHint(hint_urls[parsedURL.host]);
            } else {
                // Warn on-network redirects, but don't block them
                if (onNetwork) {
                    showUserHint('You\'re on a Miami network, so you probably don\'t need a proxy.');
                }
                // TODO: Consider dropping HTTPS support? Is this useful?
                if (parsedURL.protocol == 'https') {
                    parsedURL.host = parsedURL.host.replace(/\./g, '-');
                }
                doRedirectToProxy(tab.id, parsedURL);
            }
        } else {
            // User clicked even though we're already proxified
            showUserHint('Looks like you\'re already using the proxy. No need to click again!');
        }
    } else {
        showUserHint('This extension only works on websites starting with http:// or https://');
    }

    // If we've been manually clicked (and auto-triggering is enabled), the journal
    // is missing from our list. Let's send the journal URL to the cloud logger.
    // We log non-http/https here in case we're missing something (ftp sites for journal data?)
    // if (!tab.incognito && !optUsageOptOut) {
    //     writeToRemoteLog(parsedURL.host);
    // }
});
