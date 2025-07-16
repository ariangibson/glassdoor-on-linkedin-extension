# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development build with watch mode
- `npm run build` - Create production build
- `npm run lint` - Run ESLint on source files
- `npm run test` - Run Jest tests

## Chrome Extension Architecture

This is a Chrome Extension that adds Glassdoor rating buttons to LinkedIn job search results.

### Key Files

- `manifest.json` - Extension configuration (Manifest V3)
- `content.js` - Content script that runs on LinkedIn job search pages
- `popup.html/popup.js` - Extension popup interface
- `styles.css` - CSS for injected buttons and rating displays

### Extension Structure

- **Content Script**: Runs on `linkedin.com/jobs/*` pages, finds job result cards and injects "📊 Glassdoor" buttons
- **Button Functionality**: Each button shows a popup with Glassdoor ratings when clicked
- **Dynamic Loading**: Uses MutationObserver to handle LinkedIn's dynamic content loading
- **Popup**: Provides status information and controls

### How It Works

1. Scans job search result cards and extracts company names
2. Injects green "G" next to company names (shows stored rating if available)
3. Clicking "G" opens Glassdoor search in popup window
4. **Two-way communication**: Glassdoor window can send ratings back to LinkedIn
5. **Auto-capture**: Clicks on ratings in Glassdoor are automatically captured
6. **Manual entry**: Green button in Glassdoor allows manual rating entry
7. **Persistent storage**: Ratings stored in localStorage and displayed as "G(4.2)"

### Development Workflow

1. Load extension in Chrome via `chrome://extensions/` (enable Developer mode)
2. Use "Load unpacked" and select this directory
3. Navigate to LinkedIn job search results to test
4. Make changes to files
5. Reload extension and refresh LinkedIn page to test changes

### API Integration

Extension needs integration with Glassdoor's API or data source. Current implementation shows demo ratings. Replace the setTimeout section in `showGlassdoorRating()` with actual API calls.

### Testing

Test on LinkedIn job search pages (`linkedin.com/jobs/search`) to ensure buttons appear on job cards and ratings display correctly across different layouts.