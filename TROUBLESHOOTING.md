# Troubleshooting Guide - Virtual Try-On Extension

This guide helps resolve common issues when installing and using the Virtual Try-On Chrome Extension.

## Installation Issues

### ❌ "Service worker registration failed. Status code: 15"

**Cause:** This error typically occurs due to syntax errors or permission issues in the background script.

**Solutions:**
1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find the Virtual Try-On extension
   - Click the refresh icon (🔄)

2. **Check file permissions:**
   - Ensure all files are readable
   - On macOS/Linux: `chmod 644 *.js *.json *.html *.css`

3. **Verify file structure:**
   ```
   virtual-tryon-zalando/
   ├── manifest.json
   ├── background.js
   ├── content.js
   ├── popup.js
   ├── popup.html
   ├── styles.css
   └── config.js
   ```

### ❌ "Cannot read properties of undefined (reading 'onAlarm')"

**Cause:** The background script was trying to use `chrome.alarms` API without proper permission.

**Solution:** This has been fixed in the latest version of `background.js`. Make sure you have the updated file.

### ❌ "Manifest file is missing or unreadable"

**Solutions:**
1. **Check manifest.json syntax:**
   - Ensure valid JSON format
   - No trailing commas
   - Proper quotes around strings

2. **Verify file location:**
   - `manifest.json` must be in the root folder
   - Select the correct folder when loading unpacked

### ❌ Extension loads but buttons don't appear

**Solutions:**
1. **Check supported sites:**
   - Make sure you're on a supported e-commerce site
   - Currently supported: Zalando, Amazon, H&M, Zara, ASOS, Nike, Adidas

2. **Reload the page:**
   - Refresh the webpage after installing the extension
   - Content scripts only inject on page load

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for error messages

## Runtime Issues

### ❌ "Failed to load config"

**Cause:** The content script cannot access the config.js file.

**Solutions:**
1. **Check web_accessible_resources in manifest.json:**
   ```json
   "web_accessible_resources": [
     {
       "resources": ["popup.html", "styles.css", "config.js"],
       "matches": ["<all_urls>"]
     }
   ]
   ```

2. **Verify config.js exists and is readable**

### ❌ Upload fails or API errors

**Solutions:**
1. **Configure n8n webhook URL:**
   - Edit `config.js`
   - Replace placeholder URL with your actual webhook
   - Save and reload extension

2. **Check file format:**
   - Only JPG and PNG files supported
   - Maximum file size: 5MB

3. **Test webhook separately:**
   - Use Postman or curl to test your n8n endpoint
   - Ensure it accepts FormData with `userImage` file

### ❌ Popup doesn't open

**Solutions:**
1. **Check popup.html path in manifest.json:**
   ```json
   "action": {
     "default_popup": "popup.html",
     "default_title": "Virtual Try-On"
   }
   ```

2. **Verify popup.html exists and is valid HTML**

3. **Check for JavaScript errors:**
   - Right-click extension icon → Inspect popup
   - Check console for errors

## Development Issues

### ❌ Changes not reflecting

**Solutions:**
1. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click refresh icon on the extension

2. **Clear storage:**
   - Right-click extension icon → Inspect popup
   - Application tab → Storage → Clear storage

3. **Hard refresh pages:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (macOS)

### ❌ Content script not injecting

**Solutions:**
1. **Check manifest.json matches:**
   ```json
   "content_scripts": [
     {
       "matches": ["https://www.zalando.com/*", ...],
       "js": ["content.js"],
       "css": ["styles.css"]
     }
   ]
   ```

2. **Add more specific selectors in config.js**

3. **Test on different sites**

## Debugging Steps

### 1. Check Extension Status
- Go to `chrome://extensions/`
- Ensure extension is enabled
- Look for error messages (red text)

### 2. Check Console Logs
- **Background script:** Right-click extension → Inspect views: background page
- **Content script:** F12 on webpage → Console
- **Popup:** Right-click extension icon → Inspect popup

### 3. Test Step by Step
1. Load extension successfully
2. Visit supported e-commerce site
3. Look for buttons on product images
4. Click button and check if popup opens
5. Upload image and test API call

### 4. Verify Configuration
- Check `config.js` has correct webhook URL
- Ensure all file paths in manifest.json are correct
- Verify all required files exist

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Extension error" | General extension failure | Check console logs |
| "Script error" | JavaScript syntax error | Check file syntax |
| "Network error" | API call failed | Check webhook URL |
| "Permission denied" | Missing permissions | Check manifest.json |
| "File not found" | Missing file reference | Check file paths |

## Getting Help

If issues persist:

1. **Check all files are present and unmodified**
2. **Verify Chrome version compatibility** (latest recommended)
3. **Test with minimal configuration** (basic webhook URL)
4. **Check browser console for detailed error messages**
5. **Try loading extension in incognito mode**

## Reset Extension

To completely reset the extension:

1. Remove extension from Chrome
2. Clear any cached data
3. Re-download/re-extract files
4. Reconfigure `config.js`
5. Reload extension

This usually resolves persistent issues.