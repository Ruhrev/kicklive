chrome.contextMenus.create({
 id: 'options',
 title: 'Options',
 contexts: ['browser_action']
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
 if (info.menuItemId === 'options') {
  chrome.tabs.create({ url: '../options/options.html' });
 }
});

function updateBadgeText() {
 let streamersLive = [];
 let streamerCount = 0;
 chrome.storage.local.get('streamers', function (result) {
  const streamers = result.streamers || [];
  for (const streamer of streamers) {
   fetch(`https://kick.com/api/v1/channels/${streamer}`)
    .then((response) => response.json())
    .then(data => {
     if (data.livestream !== null) {
      streamersLive.push(streamer);
     } else {
      return;
     }
    })
    .catch(error => console.error(error));
  }
  setTimeout(function() {
    streamerCount += streamersLive.length;
    chrome.browserAction.setBadgeText({ text: streamerCount.toString() });
  }, 2000);
 });
}

setInterval(updateBadgeText, 60000);

updateBadgeText();