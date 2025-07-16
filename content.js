// Content script for LinkedIn job search pages
// Production version - minimal logging
// console.log('[Extension] Glassdoor on LinkedIn extension loaded');

// Storage for company ratings
const companyRatings = {};

// Load stored ratings from localStorage
function loadStoredRatings() {
  try {
    const stored = localStorage.getItem('glassdoor_ratings');
    if (stored) {
      Object.assign(companyRatings, JSON.parse(stored));
    }
  } catch (e) {
    console.error('[Extension] Error loading stored ratings:', e);
  }
}

// Save ratings to localStorage
function saveRatings() {
  try {
    localStorage.setItem('glassdoor_ratings', JSON.stringify(companyRatings));
  } catch (e) {
    console.error('[Extension] Error saving ratings:', e);
  }
}

// Listen for messages from Chrome extension (background script)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GLASSDOOR_RATING') {
    const { companyName, rating } = message;
    
    // Store the rating
    companyRatings[companyName.toLowerCase()] = rating;
    saveRatings();
    
    // Update UI to show the rating
    updateCompanyRatingDisplay(companyName, rating);
    
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open
});

// Also keep the window message listener as fallback
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://www.glassdoor.com') {
    return;
  }
  
  if (event.data.type === 'GLASSDOOR_RATING') {
    const { companyName, rating } = event.data;
    
    // Store the rating
    companyRatings[companyName.toLowerCase()] = rating;
    saveRatings();
    
    // Update UI to show the rating
    updateCompanyRatingDisplay(companyName, rating);
  }
});

// Load stored ratings on page load
loadStoredRatings();

// Wait for page to load and watch for dynamic content
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Initial injection
  injectGlassdoorButtons();
  
  // Watch for new job results (LinkedIn loads content dynamically)
  let timeoutId;
  const observer = new MutationObserver(() => {
    // Debounce to reduce excessive calls
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      injectGlassdoorButtons();
    }, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function injectGlassdoorButtons() {
  // Try multiple selectors for job cards
  const selectors = [
    '.job-search-card',
    '.jobs-search-results__list-item', 
    '.jobs-search__results-list li',
    '.scaffold-layout__list-item',
    '.job-card-container',
    '[data-job-id]',
    '.artdeco-entity-lockup'
  ];
  
  let jobCards = [];
  for (const selector of selectors) {
    const found = document.querySelectorAll(`${selector}:not([data-glassdoor-injected])`);
    if (found.length > 0) {
      jobCards = found;
      break;
    }
  }
  
  if (jobCards.length === 0) {
    return; // No job cards found
  }
  
  jobCards.forEach(card => {
    const companyName = extractCompanyFromJobCard(card);
    if (companyName) {
      addGlassdoorButton(card, companyName);
      card.setAttribute('data-glassdoor-injected', 'true');
    }
  });
}

function extractCompanyFromJobCard(jobCard) {
  // Try different selectors for company name in job cards
  const selectors = [
    '.job-search-card__subtitle-link',
    '.job-search-card__subtitle',
    'a[data-tracking-control-name="job_search_company_name"]',
    '.jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__subtitle-link',
    // Additional selectors for current LinkedIn layout
    '.entity-result__primary-subtitle',
    '.entity-result__secondary-subtitle',
    'a[data-control-name="job_search_company_name"]',
    '.job-details-jobs-unified-top-card__company-name',
    '.artdeco-entity-lockup__subtitle',
    '.jobs-search-results-list__item-subtitle',
    'span[aria-label*="Company"]',
    '.t-14 a[href*="/company/"]'
  ];
  
  for (const selector of selectors) {
    const element = jobCard.querySelector(selector);
    if (element && element.textContent && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // Fallback: look for company links
  const links = jobCard.querySelectorAll('a[href*="/company/"]');
  if (links.length > 0 && links[0].textContent) {
    return links[0].textContent.trim();
  }
  
  return null;
}

function addGlassdoorButton(jobCard, companyName) {
  // Find the company name element to add the G next to it
  const companyElement = jobCard.querySelector('.artdeco-entity-lockup__subtitle span');
  
  if (!companyElement) {
    return; // Could not find company element
  }
  
  // Check if we already added a G to this element
  if (companyElement.querySelector('.glassdoor-g')) {
    return; // Already has a Glassdoor G
  }
  
  // Check if we have a stored rating
  const storedRating = companyRatings[companyName.toLowerCase()];
  
  // Create the green G element
  const glassdoorG = document.createElement('span');
  glassdoorG.className = 'glassdoor-g';
  glassdoorG.setAttribute('data-company', companyName);
  
  // Set base styles
  glassdoorG.style.cssText = `
    font-weight: bold;
    cursor: pointer;
    margin-left: 4px;
    font-size: 16px;
  `;
  
  if (storedRating) {
    if (storedRating === 'N/A') {
      glassdoorG.textContent = ` G (N/A)`;
      glassdoorG.title = `No Glassdoor rating found for ${companyName} - Click to search again`;
      glassdoorG.style.color = '#6c757d'; // Gray for N/A
    } else {
      glassdoorG.textContent = ` G (${String(storedRating)})`;
      glassdoorG.title = `Glassdoor rating: ${storedRating}/5 for ${companyName} - Click to update`;
      glassdoorG.style.color = '#0caa41'; // Green for ratings
    }
  } else {
    glassdoorG.textContent = ' G';
    glassdoorG.title = `Get Glassdoor rating for ${companyName}`;
    glassdoorG.style.color = '#0caa41'; // Green for new
  }
  
  glassdoorG.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showGlassdoorRating(glassdoorG, companyName);
  });
  
  // Add the G after the company name
  companyElement.appendChild(glassdoorG);
}

// Function to update rating display when new rating is received
function updateCompanyRatingDisplay(companyName, rating) {
  if (!companyName || !rating) return; // Safety check
  
  const glassdoorGs = document.querySelectorAll(`[data-company="${companyName}"]`);
  glassdoorGs.forEach(g => {
    if (rating === 'N/A') {
      g.textContent = ` G (N/A)`;
      g.title = `No Glassdoor rating found for ${companyName} - Click to search again`;
      g.style.color = '#6c757d'; // Gray for N/A
    } else {
      g.textContent = ` G (${String(rating)})`;
      g.title = `Glassdoor rating: ${rating}/5 for ${companyName} - Click to update`;
      g.style.color = '#0caa41'; // Green for ratings
    }
  });
}

function showGlassdoorRating(button, companyName) {
  // Encode company name for URL
  const encodedCompany = encodeURIComponent(companyName);
  const glassdoorUrl = `https://www.glassdoor.com/Search/results.htm?keyword=${encodedCompany}`;
  
  // Open in a new popup window
  const popup = window.open(
    glassdoorUrl,
    'glassdoor_popup',
    'width=900,height=700,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=no'
  );
  
  if (popup) {
    popup.focus();
    
    // Store reference to send company name to Glassdoor window
    setTimeout(() => {
      try {
        popup.postMessage({
          type: 'COMPANY_NAME',
          companyName: companyName
        }, 'https://www.glassdoor.com');
      } catch (e) {
        console.log('[Extension] Could not send company name to popup:', e);
      }
    }, 2000); // Wait for popup to load
  } else {
    // Fallback if popup blocked - show message
    const notification = document.createElement('div');
    notification.className = 'glassdoor-notification';
    notification.innerHTML = `
      <div class="glassdoor-notification-content">
        <strong>Popup blocked!</strong><br>
        <a href="${glassdoorUrl}" target="_blank">Click here to open Glassdoor search for ${companyName}</a>
        <button class="glassdoor-notification-close">×</button>
      </div>
    `;
    
    notification.querySelector('.glassdoor-notification-close').addEventListener('click', () => {
      notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}