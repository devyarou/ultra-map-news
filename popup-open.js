document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('open-map').addEventListener('click', function() {
    chrome.tabs.create({ url: chrome.runtime.getURL('map.html') });
  });
}); 