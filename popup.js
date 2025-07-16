// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const statusDiv = document.getElementById('status');
  
  if (tab.url && tab.url.includes('linkedin.com/jobs')) {
    statusDiv.className = 'status active';
    statusDiv.innerHTML = '<p>✓ Active on LinkedIn job search</p>';
  } else {
    statusDiv.className = 'status inactive';
    statusDiv.innerHTML = '<p>Navigate to LinkedIn job search to see Glassdoor buttons</p>';
  }
});