const streamersList = document.getElementById('streamers');
const addStreamerForm = document.getElementById('addStreamerForm');
const addStreamerInput = document.getElementById('streamerInput');

function displayStreamers(streamers) {
  streamersList.innerHTML = '';
  for (let i = 0; i < streamers.length; i++) {
    const streamer = streamers[i];
    const streamerItem = document.createElement('li');
    streamerItem.textContent = streamer;

    // Add minus sign to remove streamer
    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.classList.add('minus-button');
    minusButton.addEventListener('click', function(event) {
      removeStreamer(streamer);
      streamerItem.remove();
    });
    streamerItem.prepend(minusButton);

    streamersList.appendChild(streamerItem);
  }
}

// Load the saved streamers from local storage and display them in the options page
chrome.storage.local.get('streamers', function(result) {
  const streamers = result.streamers || [];
  displayStreamers(streamers);
});

// Add a new streamer to the list when the "Add" button is clicked
addStreamerForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const streamer = addStreamerInput.value.trim().toLowerCase();
  if (streamer) {
    const streamerItem = document.createElement('li');
    streamerItem.textContent = streamer;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = ' - ';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', function(event) {
      event.preventDefault();
      streamerItem.remove();
      chrome.storage.local.get('streamers', function(result) {
        const streamers = result.streamers || [];
        const index = streamers.indexOf(streamer);
        if (index !== -1) {
          streamers.splice(index, 1);
          chrome.storage.local.set({streamers: streamers});
        }
      });
    });
    streamerItem.prepend(deleteButton);
    streamersList.appendChild(streamerItem);
    chrome.storage.local.get('streamers', function(result) {
      const streamers = result.streamers || [];
      streamers.push(streamer);
      chrome.storage.local.set({streamers: streamers}, function() {
        displayStreamers(streamers);
      });
    });
    addStreamerInput.value = '';
  }
});

// Function to remove a streamer from local storage
function removeStreamer(streamer) {
  chrome.storage.local.get('streamers', function(result) {
    const streamers = result.streamers || [];
    const index = streamers.indexOf(streamer);
    if (index !== -1) {
      streamers.splice(index, 1);
      chrome.storage.local.set({streamers: streamers});
    }
  });
}