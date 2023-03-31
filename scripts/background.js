// Create the context menu
chrome.contextMenus.create({
 id: 'options',
 title: 'Options',
 contexts: ['browser_action']
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
 if (info.menuItemId === 'options') {
   chrome.tabs.create({ url: '../options/options.html' });
 }
});

function updateBadgeText() {
  const streamersLive = [];
  chrome.storage.local.get('streamers', function(result) {
    const streamers = result.streamers || [];
    for (const streamer of streamers) {
      fetch(`https://kick.com/api/v1/channels/${streamer}`)
        .then((response) => response.json())
        .then(data => {
          if (data.livestream !== null) {
            streamersLive.push(streamer);
          }
          chrome.browserAction.setBadgeText({text: streamersLive.length.toString()});
        })
        .catch(error => console.error(error));
    }
  });
}

setInterval(updateBadgeText, 20000);

// Call the updateBadgeText function once when the extension is first loaded
updateBadgeText();
