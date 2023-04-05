
let streamers = [];
let streamersLive = [];
let cachedData = {};

chrome.storage.local.get('streamers', function (result) {
 streamers = result.streamers || streamers;
 for (const streamer of streamers) {
  fetch(`https://kick.com/api/v1/channels/${streamer}`)
   .then((response) => response.json())
   .then(data => {
    if (data.livestream === null) {
     return;
    } else {
     cachedData[streamer] = data;
     streamersLive.push(streamer);
     createOrUpdateStreamerElement(streamer, data);
    }
   });
 }
});

function createOrUpdateStreamerElement(channel, data) {
 let streamerElement = document.getElementById(channel);
 console.log(data)
 if (!streamerElement) {
  streamerElement = document.createElement('li');
  streamerElement.id = channel;
  streamerElement.onclick = function () {
   window.open(`https://kick.com/${channel}`);
  }
  document.getElementById('streamers').appendChild(streamerElement);
 }
 if (data.livestream.is_live === false) {
  streamerElement.remove();
  streamersLive.splice(streamersLive.indexOf(channel), 1);
 } else {
  const category = data.recent_categories[0].name.toUpperCase();
  const viewers = data.livestream.viewer_count ? data.livestream.viewer_count.toString() : 'unknown';
  streamerElement.innerHTML = `<div>${category}</div><hr><div>${channel} <span style="float:right">${viewers}</span></div><br>`;
  streamerElement.style.color = '#e0e0e0';
  if (!streamersLive.includes(channel)) {
   streamersLive.push(channel);
  }
 }
}

setInterval(() => {
 for (const streamer of streamersLive) {
  fetch(`https://kick.com/api/v1/channels/${streamer}`)
   .then((response) => response.json())
   .then(data => {
    if (data && data.livestream.is_live === true) {
     cachedData[streamer] = data;
     updateStreamerElement(streamer, data);
    } else {
     const index = streamersLive.indexOf(streamer);
     if (index > -1) {
      streamersLive.splice(index, 1);
      document.getElementById(streamer).remove();
     }
    }
   });
 }
 for (const channel of Object.keys(cachedData)) {
  if (!streamersLive.includes(channel)) {
   fetch(`https://kick.com/api/v1/channels/${channel}`)
    .then((response) => response.json())
    .then(data => {
     if (data.livestream === null) {
      return;
     } else {
      cachedData[channel] = data;
      streamersLive.push(channel);
      createOrUpdateStreamerElement(channel, data);
     }
    });
  }
 }
}, 10000);

function updateStreamerElement(channel, data) {
 const category = data.recent_categories[0].name.toUpperCase();
 const viewers = data.livestream.viewer_count ? data.livestream.viewer_count.toString() : 'unknown';
 const streamerElement = document.getElementById(channel);
 streamerElement.innerHTML = `<div>${category}</div><hr><div>${channel} <span style="float:right">${viewers}</span></div><br>`;

 if (cachedData[channel].recent_categories[0].name.toUpperCase() !== category) {
 } else {
  streamerElement.style.color = '#e0e0e0';
 }

 cachedData[channel] = data;
}