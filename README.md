# Glassdoor on LinkedIn Chrome Extension

🚀 **Supercharge your job search** by seamlessly integrating Glassdoor company ratings directly into LinkedIn job search results.

![Extension Demo](https://img.shields.io/badge/Chrome-Extension-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **Smart Integration**: Adds a green "G" next to company names on LinkedIn job listings
- **One-Click Access**: Click the "G" to instantly open Glassdoor search for that company
- **Auto-Detection**: Automatically detects and pre-fills company ratings from Glassdoor
- **Dynamic Interface**: Smart button that updates text as you type ("Send 3.4 Rating")
- **Persistent Storage**: Ratings are saved locally and displayed as "G (4.2)" for future visits
- **N/A Support**: Handles companies with no ratings gracefully ("G (N/A)" in gray)
- **Beautiful UI**: Clean, intuitive interface with smooth animations and real-time feedback
- **Completely Legal**: No scraping - uses legitimate browsing and user-controlled data entry

## 🎯 How It Works

1. **Browse LinkedIn Jobs**: Navigate to LinkedIn job search results
2. **Spot the Green G**: See a green "G" next to each company name
3. **Get Ratings**: Click the "G" to open Glassdoor in a popup window
4. **Auto-Population**: Extension detects ratings and pre-fills the form (or "N/A" if none found)
5. **Dynamic Button**: Button text updates as you type ("Send 3.4 Rating" or "Send N/A Rating")
6. **One-Click Send**: Review and send the rating back to LinkedIn
7. **Persistent Display**: Ratings appear as "G (4.2)" (green) or "G (N/A)" (gray) and persist across sessions

## 🛠️ Installation

### From Source (Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/glassdoor-on-linkedin-extension.git
   cd glassdoor-on-linkedin-extension
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the project folder

3. **Start using**:
   - Navigate to LinkedIn job search results
   - Look for green "G" icons next to company names
   - Click and enjoy!

## 📖 Usage Guide

### First Time Setup
1. Install the extension following the instructions above
2. Navigate to LinkedIn job search: `linkedin.com/jobs/search`
3. You'll see green "G" letters appear next to company names

### Getting Company Ratings
1. **Click the green "G"** next to any company name
2. **Glassdoor window opens** with search results for that company
3. **Review the pre-filled rating** in the floating form (top-right corner)
4. **Adjust if needed** - the rating field is editable
5. **Click "Send Rating & Close"** to save and return to LinkedIn
6. **Rating appears** as "G (4.2)" next to the company name

### Managing Ratings
- **View saved ratings**: Green "G (4.2)" indicates you have a saved rating
- **Update ratings**: Click the "G" again to get fresh data
- **Persistent storage**: Ratings survive browser restarts and page refreshes

## 🔧 Technical Details

### Architecture
- **Manifest V3** Chrome extension
- **Content Scripts** for LinkedIn and Glassdoor pages
- **Background Service Worker** for cross-tab communication
- **LocalStorage** for persistent rating storage
- **PostMessage API** for secure window communication

### Files Structure
```
├── manifest.json          # Extension configuration
├── content.js             # LinkedIn page integration
├── glassdoor.js           # Glassdoor page integration  
├── background.js          # Cross-tab messaging
├── popup.html/popup.js    # Extension popup
├── styles.css             # UI styling
└── CLAUDE.md             # Development documentation
```

### Privacy & Security
- **No data collection**: All ratings stored locally on your device
- **No external servers**: Direct browser-to-browser communication
- **Secure messaging**: Uses Chrome's built-in messaging APIs
- **Respects ToS**: No automated scraping or data extraction

## 🚀 Development

### Prerequisites
- Google Chrome (latest version)
- Basic understanding of JavaScript and Chrome extensions

### Development Commands
```bash
# Install dependencies (if using build tools)
npm install

# Start development build with watch mode
npm run dev

# Create production build
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

### Key Technologies
- **Chrome Extension APIs**: Messaging, storage, content scripts
- **JavaScript ES6+**: Modern async/await patterns
- **DOM Manipulation**: Dynamic UI injection and updates
- **LocalStorage API**: Client-side data persistence
- **PostMessage API**: Secure cross-window communication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on LinkedIn job search pages
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This extension is for personal use to enhance your job searching experience. It respects the terms of service of both LinkedIn and Glassdoor by not performing any automated data extraction. All data entry is user-controlled and manual.

## 🙏 Acknowledgments

- Built with passion for improving the job search experience
- Inspired by the need for better integration between professional platforms
- Thanks to the Chrome Extension community for excellent documentation

---

**Happy job hunting!** 🎯 May your search be efficient and successful! 

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red)