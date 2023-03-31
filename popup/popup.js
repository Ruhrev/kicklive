
let streamers = []; // Default streamers
let streamersLive = []; // Live streamers
let cachedData = {}; // Cached streamer data

// Load initial streamers and their data
chrome.storage.local.get('streamers', function(result) {
  streamers = result.streamers || streamers;
  for (const streamer of streamers) {
    fetch(`https://kick.com/api/v1/channels/${streamer}`)
      .then((response) => response.json())
      .then(data => {
        if (data.livestream === null) {
          return;
        } else {
          // Cache the data
          cachedData[streamer] = data;
          streamersLive.push(streamer);
          createOrUpdateStreamerElement(streamer, data);
        }
      });
  }
});

// Create or update streamer element
function createOrUpdateStreamerElement(channel, data) {
  let streamerElement = document.getElementById(channel);
  console.log(data)
  if (!streamerElement) {
    streamerElement = document.createElement('li');
    streamerElement.id = channel;
    streamerElement.onclick = function() {
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

// Update streamers data every 10 seconds
setInterval(() => {
 for (const streamer of streamersLive) {
   fetch(`https://kick.com/api/v1/channels/${streamer}`)
     .then((response) => response.json())
     .then(data => {
       if (data && data.livestream.is_live === true) {
         // Update cached data
         cachedData[streamer] = data;
         updateStreamerElement(streamer, data);
       } else {
         // Remove streamer from live list if not live
         const index = streamersLive.indexOf(streamer);
         if (index > -1) {
           streamersLive.splice(index, 1);
           document.getElementById(streamer).remove();
         }
       }
     });
 }
 // Load new streamers data
 for (const channel of Object.keys(cachedData)) {
   if (!streamersLive.includes(channel)) {
     fetch(`https://kick.com/api/v1/channels/${channel}`)
       .then((response) => response.json())
       .then(data => {
         if (data.livestream === null) {
           return;
         } else {
           // Cache the data
           cachedData[channel] = data;
           streamersLive.push(channel);
           createOrUpdateStreamerElement(channel, data);
         }
       });
   }
 }
}, 10000);

// Update streamer element with new data
function updateStreamerElement(channel, data) {
  const category = data.recent_categories[0].name.toUpperCase();
  const viewers = data.livestream.viewer_count ? data.livestream.viewer_count.toString() : 'unknown';
  const streamerElement = document.getElementById(channel);
  streamerElement.innerHTML = `<div>${category}</div><hr><div>${channel} <span style="float:right">${viewers}</span></div><br>`;

  // Check if streamer is playing a different category
  if (cachedData[channel].recent_categories[0].name.toUpperCase() !== category) {
    streamerElement.style.color = '#ffbe00'; // Change text color to yellow if category changed
  } else {
    streamerElement.style.color = '#e0e0e0';
  }

  // Update cached data
  cachedData[channel] = data;
}
