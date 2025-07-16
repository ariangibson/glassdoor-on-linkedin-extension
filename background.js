// Background script to handle messaging between Glassdoor and LinkedIn
console.log('[Extension] Background script loaded');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Extension] Background received message:', message);
  
  if (message.type === 'GLASSDOOR_RATING') {
    // Forward the rating to all LinkedIn tabs
    chrome.tabs.query({ url: "*://www.linkedin.com/jobs/*" }, (tabs) => {
      console.log('[Extension] Found LinkedIn tabs:', tabs.length);
      
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'GLASSDOOR_RATING',
          companyName: message.companyName,
          rating: message.rating
        }).catch(error => {
          console.log('[Extension] Error sending to tab:', error);
        });
      });
    });
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});