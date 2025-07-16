// Content script for Glassdoor pages
// Production version - minimal logging

let currentCompanyName = '';

// Listen for company name from LinkedIn window
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  
  if (event.data.type === 'COMPANY_NAME') {
    currentCompanyName = event.data.companyName;
    setupRatingCapture();
  }
});

function setupRatingCapture() {
  // Create floating rating form instead of click listeners
  addRatingForm();
}

function addRatingForm() {
  // Auto-grab the first rating from the page
  const autoRating = findFirstRating();
  
  // If no company name yet, try to get it from URL or page
  if (!currentCompanyName) {
    currentCompanyName = extractCompanyFromURL() || 'Unknown Company';
  }
  
  const form = document.createElement('div');
  form.className = 'extension-rating-form';
  form.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid #0caa41;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      min-width: 280px;
    ">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0caa41" stroke-width="2" style="margin-right: 8px;">
          <polygon points="12 2 15.09 8.26 22 9 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9 8.91 8.26 12 2"/>
        </svg>
        <strong style="color: #333; font-size: 16px;">Send Rating to LinkedIn</strong>
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666; font-weight: 500;">
          Company: ${currentCompanyName}
        </label>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #666; font-weight: 500;">
          Rating (0-5):
        </label>
        <input 
          type="text" 
          id="rating-input" 
          value="${autoRating || 'N/A'}"
          style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          "
          placeholder="Enter rating or N/A"
        />
      </div>
      
      <button id="send-rating-btn" style="
        width: 100%;
        background: #0caa41;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        margin-bottom: 8px;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
        </svg>
        <span id="button-text">Send ${autoRating || 'N/A'} Rating</span>
      </button>
      
      <div style="margin-top: 8px; font-size: 11px; color: #666; text-align: center;">
        Auto-detected: ${autoRating ? autoRating + '/5' : 'No rating found'}
      </div>
    </div>
  `;
  
  document.body.appendChild(form);
  
  // Add click handler for send button
  document.getElementById('send-rating-btn').addEventListener('click', () => {
    const rating = document.getElementById('rating-input').value.trim();
    
    if (rating === 'N/A' || rating.toLowerCase() === 'n/a') {
      sendRatingToLinkedIn(currentCompanyName, 'N/A');
    } else if (rating && !isNaN(rating)) {
      const numRating = parseFloat(rating);
      if (numRating >= 0 && numRating <= 5) {
        sendRatingToLinkedIn(currentCompanyName, numRating.toFixed(1));
      } else {
        alert('Please enter a rating between 0 and 5, or "N/A"');
      }
    } else {
      alert('Please enter a valid rating (0-5) or "N/A"');
    }
  });
  
  // Add input listener to update button text dynamically
  const ratingInput = document.getElementById('rating-input');
  const buttonText = document.getElementById('button-text');
  
  ratingInput.addEventListener('input', () => {
    const value = ratingInput.value.trim();
    buttonText.textContent = `Send ${value || 'N/A'} Rating`;
  });
  
  // Add Enter key listener to submit when user presses Enter
  ratingInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('send-rating-btn').click();
    }
  });
  
  // Add hover effect
  const sendBtn = document.getElementById('send-rating-btn');
  sendBtn.addEventListener('mouseenter', () => {
    sendBtn.style.background = '#0a8f37';
  });
  sendBtn.addEventListener('mouseleave', () => {
    sendBtn.style.background = '#0caa41';
  });
}

function findFirstRating() {
  // Look for rating elements on the page, prioritizing Companies section
  
  // First, try to find company ratings specifically
  const companyRatingSelectors = [
    '.employer-card_employerRatingContainer__w93y9', // New specific selector for company cards
    '[data-test="company-card"] [class*="rating"]',  // Any rating inside company card
    '.CompanyCard_employerCardWrapper__H_LZN [class*="rating"]', // Rating in company wrapper
    '.employer-card_employerContainer__welQ6 [class*="rating"]' // Rating in employer container
  ];
  
  for (const selector of companyRatingSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const rating = extractRatingFromElement(element);
      if (rating) {
        return rating;
      }
    }
  }
  
  // Second priority: look in main content but skip job sections
  const companiesSection = document.querySelector('#MainCol, .mainContent, [data-test="employer-overview"]');
  if (companiesSection) {
    const generalRatingSelectors = [
      '.rating-single-star_RatingSingleStarContainer__PEAtE',
      '[data-test="rating"]',
      '[data-test*="rating"]',
      '.css-1c77mya',
      '.rating',
      '.ratingNumber',
      '[class*="rating"]',
      '[class*="Rating"]'
    ];
    
    for (const selector of generalRatingSelectors) {
      const elements = companiesSection.querySelectorAll(selector);
      for (const element of elements) {
        // Skip if this element is inside a job listing
        if (element.closest('.job-search-card, .jobsSearch, [class*="job"], [data-test*="job"]')) {
          continue;
        }
        const rating = extractRatingFromElement(element);
        if (rating) {
          return rating;
        }
      }
    }
  }
  
  // If we can't find a company rating, return null for N/A
  return null;
}

function extractRatingFromElement(element) {
  // Try to extract rating from various formats
  const text = element.textContent || element.innerText || '';
  
  // Look for patterns like "4.2", "4.2/5", "4.2 out of 5"
  const ratingMatch = text.match(/(\d+\.?\d*)\s*(?:\/\s*5|out\s+of\s+5)?/i);
  if (ratingMatch) {
    const rating = parseFloat(ratingMatch[1]);
    if (rating >= 0 && rating <= 5) {
      return rating.toFixed(1);
    }
  }
  
  // Check for data attributes
  const dataRating = element.getAttribute('data-rating') || 
                    element.getAttribute('data-test-rating') ||
                    element.getAttribute('aria-label');
  
  if (dataRating) {
    const match = dataRating.match(/(\d+\.?\d*)/);
    if (match) {
      const rating = parseFloat(match[1]);
      if (rating >= 0 && rating <= 5) {
        return rating.toFixed(1);
      }
    }
  }
  
  return null;
}

function extractCompanyFromURL() {
  // Try to extract company name from URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get('keyword');
  if (keyword) {
    console.log('[Extension] Extracted company from URL:', keyword);
    return decodeURIComponent(keyword);
  }
  return null;
}

function sendRatingToLinkedIn(companyName, rating) {
  console.log('[Extension] Attempting to send rating:', rating, 'for company:', companyName);
  
  try {
    // Use Chrome extension messaging instead of window.opener
    console.log('[Extension] Using Chrome extension messaging');
    
    // Send message to all content scripts (LinkedIn tabs will receive it)
    chrome.runtime.sendMessage({
      type: 'GLASSDOOR_RATING',
      companyName: companyName,
      rating: rating
    }).then(() => {
      console.log('[Extension] Rating sent via Chrome messaging');
      showRatingConfirmation(companyName, rating);
      
      // Close window after short delay
      setTimeout(() => {
        window.close();
      }, 1500);
    }).catch((error) => {
      console.log('[Extension] Chrome messaging error:', error);
      
      // Fallback: try window.opener approach
      if (window.opener && !window.opener.closed) {
        console.log('[Extension] Falling back to window.opener');
        window.opener.postMessage({
          type: 'GLASSDOOR_RATING',
          companyName: companyName,
          rating: rating
        }, '*');
        
        showRatingConfirmation(companyName, rating);
        setTimeout(() => window.close(), 1500);
      } else {
        alert('Unable to send rating - please try again');
      }
    });
    
  } catch (e) {
    console.log('[Extension] Error sending rating:', e);
    alert('Error sending rating: ' + e.message);
  }
}

function showRatingConfirmation(companyName, rating) {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4caf50;
      color: white;
      padding: 24px 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10001;
      font-family: Arial, sans-serif;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      min-width: 300px;
    ">
      ✅ Rating ${rating === 'N/A' ? 'N/A' : rating + '/5'} sent!<br>
      <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">
        ${companyName}
      </div>
      <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
        Window closing...
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
}

// Initialize after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupRatingCapture, 1000);
  });
} else {
  setTimeout(setupRatingCapture, 1000);
}