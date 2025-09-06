# Virtual Try-On Chrome Extension

A Chrome Extension (Manifest V3) that adds virtual try-on functionality to e-commerce websites like Zalando, Amazon, H&M, and more.

## Features

- 👕 **One-Click Virtual Try-On**: Adds "👕 Virtual Try" buttons next to product images
- 📷 **Photo Upload**: Easy drag-and-drop or click-to-upload interface
- 🤖 **AI Integration**: Connects to n8n webhook for AI-powered virtual try-on processing
- 🎨 **Clean UI**: Modern, responsive popup interface
- 🛍️ **Multi-Site Support**: Works on major e-commerce platforms

## Supported E-commerce Sites

- Zalando (all regions)
- Amazon (US, DE, UK)
- H&M
- Zara
- ASOS
- Nike
- Adidas

## Installation

### For Development

1. **Clone or download** this repository to your local machine

2. **Configure the n8n webhook URL**:
   - Open [`config.js`](config.js)
   - Replace `https://your-n8n-instance.com/webhook/virtual-tryon` with your actual n8n webhook URL

3. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing this extension

4. **Create extension icons** (optional):
   - Add 16x16, 48x48, and 128x128 pixel PNG icons to the `icons/` folder
   - Or use placeholder icons for testing

## Usage

1. **Visit a supported e-commerce site** (e.g., zalando.com)

2. **Look for product images** - you'll see "👕 Virtual Try" buttons appear

3. **Click the Virtual Try button** next to any product image

4. **Upload your photo**:
   - Click the upload area or drag and drop an image
   - Supported formats: JPG, PNG (max 5MB)

5. **Generate virtual try-on**:
   - Click "Generate Virtual Try-On"
   - Wait for the AI processing to complete

6. **View and download results**:
   - See your virtual try-on result
   - Download the image if desired

## Configuration

### n8n Webhook Setup

Your n8n webhook should expect:
- `userImage`: File upload (user's photo)
- `productImageUrl`: String (URL of the product image)
- `pageUrl`: String (current page URL)

Expected response format:
```json
{
  "success": true,
  "resultImageUrl": "https://your-storage.com/result-image.jpg"
}
```

### Customizing Supported Sites

Edit [`config.js`](config.js) to add more e-commerce sites:

```javascript
PRODUCT_IMAGE_SELECTORS: {
  yoursite: [
    '.your-product-image-selector',
    '.another-selector img'
  ]
}
```

## File Structure

```
virtual-tryon-extension/
├── manifest.json          # Extension manifest (MV3)
├── config.js             # Configuration and site selectors
├── content.js            # Content script (injects buttons)
├── popup.html            # Popup UI structure
├── popup.js              # Popup functionality
├── background.js         # Background service worker
├── styles.css            # All styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Development

### Key Components

- **Content Script** ([`content.js`](content.js)): Detects product images and injects try-on buttons
- **Popup** ([`popup.html`](popup.html), [`popup.js`](popup.js)): Handles user interaction and API calls
- **Background Script** ([`background.js`](background.js)): Manages messaging between components
- **Configuration** ([`config.js`](config.js)): Centralized settings and site-specific selectors

### Adding New E-commerce Sites

1. Add the domain to [`manifest.json`](manifest.json) content_scripts matches
2. Add selectors to [`config.js`](config.js) PRODUCT_IMAGE_SELECTORS
3. Test the button injection on the new site

### Customizing the UI

- Modify [`styles.css`](styles.css) for visual changes
- Update [`popup.html`](popup.html) for structural changes
- Extend [`popup.js`](popup.js) for new functionality

## API Integration

The extension sends a POST request to your n8n webhook with:

```javascript
const formData = new FormData();
formData.append('userImage', userImageFile);
formData.append('productImageUrl', productImageUrl);
formData.append('pageUrl', currentPageUrl);
```

## Troubleshooting

### Buttons Not Appearing
- Check if the site is in the supported list
- Verify the product image selectors in [`config.js`](config.js)
- Check browser console for errors

### Upload Issues
- Ensure file is JPG/PNG and under 5MB
- Check network connectivity
- Verify n8n webhook URL in [`config.js`](config.js)

### API Errors
- Confirm n8n webhook is accessible
- Check webhook response format
- Review browser network tab for request details

## License

This project is open source. Feel free to modify and extend for your needs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the browser console for error messages
- Verify your n8n webhook configuration
- Test with different e-commerce sites