# Chrome Extension Installation Guide (Developer Mode)

Follow these step-by-step instructions to install the Virtual Try-On Chrome Extension in developer mode.

## Prerequisites

- Google Chrome browser (latest version recommended)
- The extension files downloaded/cloned to your computer

## Step-by-Step Installation

### 1. Open Chrome Extensions Page

**Method 1:** Type in address bar
```
chrome://extensions/
```

**Method 2:** Menu navigation
- Click the three dots menu (⋮) in the top-right corner of Chrome
- Go to **More tools** → **Extensions**

### 2. Enable Developer Mode

- Look for the **"Developer mode"** toggle in the top-right corner of the extensions page
- Click the toggle to turn it **ON** (it should turn blue/green)

![Developer Mode Toggle](https://developer.chrome.com/static/docs/extensions/mv3/getstarted/image/extensions-page-e1573c.png)

### 3. Load the Extension

- Click the **"Load unpacked"** button (appears after enabling Developer mode)
- Navigate to the folder containing the extension files
- Select the folder that contains `manifest.json` (this should be `/Users/a.bhatia/extra/virtual-tryon-zalando/`)
- Click **"Select Folder"** or **"Open"**

### 4. Verify Installation

After loading, you should see:
- The extension appears in your extensions list
- Extension icon in the Chrome toolbar (if visible)
- No error messages (red text)

### 5. Configure the Extension

**Important:** Before using the extension, you must configure the n8n webhook URL:

1. Open the [`config.js`](config.js) file in a text editor
2. Find this line:
   ```javascript
   N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/virtual-tryon',
   ```
3. Replace `'https://your-n8n-instance.com/webhook/virtual-tryon'` with your actual n8n webhook URL
4. Save the file
5. Go back to `chrome://extensions/`
6. Click the **refresh icon** (🔄) on the Virtual Try-On extension card to reload it

## Testing the Extension

### Option 1: Use the Test Page
1. Open the [`test.html`](test.html) file in Chrome:
   - Right-click on `test.html` in your file explorer
   - Select "Open with" → "Google Chrome"
   - Or drag the file into a Chrome window

2. You should see "👕 Virtual Try" buttons appear on the product images

### Option 2: Visit a Real E-commerce Site
1. Go to any supported site (e.g., zalando.com, amazon.com)
2. Navigate to a product page
3. Look for "👕 Virtual Try" buttons next to product images

## Troubleshooting

### Extension Not Loading
- **Check file structure**: Make sure `manifest.json` is in the root folder
- **Check for errors**: Look for red error text on the extensions page
- **Reload extension**: Click the refresh icon on the extension card

### Buttons Not Appearing
- **Check console**: Press F12 → Console tab for error messages
- **Verify site support**: Make sure you're on a supported e-commerce site
- **Reload page**: Refresh the webpage after installing the extension

### Common Error Messages

**"Manifest file is missing or unreadable"**
- Solution: Make sure you selected the correct folder containing `manifest.json`

**"Could not load manifest"**
- Solution: Check that `manifest.json` has valid JSON syntax

**"This extension may have been corrupted"**
- Solution: Re-download the extension files and try again

## File Structure Verification

Your extension folder should contain these files:
```
virtual-tryon-zalando/
├── manifest.json          ✓ Required
├── config.js             ✓ Required
├── content.js            ✓ Required
├── popup.html            ✓ Required
├── popup.js              ✓ Required
├── background.js         ✓ Required
├── styles.css            ✓ Required
├── icon16.png            ✓ Extension icon (16x16)
├── icon32.png            ✓ Extension icon (32x32)
├── icon48.png            ✓ Extension icon (48x48)
├── icon128.png           ✓ Extension icon (128x128)
├── test.html             ✓ For testing
├── README.md             ✓ Documentation
└── INSTALLATION.md       ✓ This file
```

## Next Steps

1. **Configure n8n webhook** in [`config.js`](config.js)
2. **Test on the test page** ([`test.html`](test.html))
3. **Visit e-commerce sites** to see buttons in action
4. **Upload photos** and test the virtual try-on functionality

## Getting Help

If you encounter issues:
1. Check the browser console (F12 → Console) for error messages
2. Verify your n8n webhook is working correctly
3. Make sure all files are present and unmodified
4. Try disabling and re-enabling the extension

## Updating the Extension

When you make changes to the extension files:
1. Go to `chrome://extensions/`
2. Find the Virtual Try-On extension
3. Click the refresh icon (🔄) to reload the extension
4. Refresh any open webpages to see the changes