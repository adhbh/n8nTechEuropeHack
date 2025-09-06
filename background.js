// Background script for Virtual Try-On Extension (Manifest V3)

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Virtual Try-On Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default configuration on first install
    chrome.storage.local.set({
      extensionEnabled: true,
      lastUsed: Date.now()
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);

  switch (request.action) {
    case 'openVirtualTry':
      handleOpenVirtualTry(request, sender, sendResponse);
      break;
    
    case 'getProductImage':
      handleGetProductImage(request, sender, sendResponse);
      break;
    
    case 'storeProductImage':
      handleStoreProductImage(request, sender, sendResponse);
      break;
    
    case 'checkExtensionStatus':
      handleCheckExtensionStatus(request, sender, sendResponse);
      break;
    
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }

  // Return true to indicate we will send a response asynchronously
  return true;
});

// Handle opening virtual try-on popup
async function handleOpenVirtualTry(request, sender, sendResponse) {
  try {
    const { productImageUrl, pageUrl } = request;
    
    // Store the product image URL for the popup to access
    await chrome.storage.local.set({
      currentProductImage: productImageUrl,
      currentPageUrl: pageUrl,
      lastUsed: Date.now()
    });

    // Send success response
    sendResponse({ 
      success: true, 
      message: 'Product image stored. Please click the extension icon to continue.' 
    });

  } catch (error) {
    console.error('Error handling openVirtualTry:', error);
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

// Handle getting product image from storage
async function handleGetProductImage(request, sender, sendResponse) {
  try {
    const result = await chrome.storage.local.get(['currentProductImage', 'currentPageUrl']);
    sendResponse({
      success: true,
      productImageUrl: result.currentProductImage,
      pageUrl: result.currentPageUrl
    });
  } catch (error) {
    console.error('Error getting product image:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Handle storing product image
async function handleStoreProductImage(request, sender, sendResponse) {
  try {
    const { productImageUrl, pageUrl } = request;
    
    await chrome.storage.local.set({
      currentProductImage: productImageUrl,
      currentPageUrl: pageUrl,
      lastUsed: Date.now()
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error('Error storing product image:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Handle checking extension status
async function handleCheckExtensionStatus(request, sender, sendResponse) {
  try {
    const result = await chrome.storage.local.get(['extensionEnabled', 'lastUsed']);
    sendResponse({
      success: true,
      enabled: result.extensionEnabled !== false, // Default to true
      lastUsed: result.lastUsed
    });
  } catch (error) {
    console.error('Error checking extension status:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Check if a URL is from a supported e-commerce site
function isSupportedSite(url) {
  const supportedDomains = [
    'zalando.com', 'zalando.de', 'zalando.fr', 'zalando.it', 'zalando.es',
    'zalando.nl', 'zalando.be', 'zalando.at', 'zalando.ch', 'zalando.pl',
    'zalando.se', 'zalando.dk', 'zalando.fi', 'zalando.no',
    'amazon.com', 'amazon.de', 'amazon.co.uk',
    'h-m.com', 'hm.com',
    'zara.com',
    'asos.com',
    'nike.com',
    'adidas.com'
  ];

  return supportedDomains.some(domain => url.includes(domain));
}

// Clean up old stored data
async function cleanupOldData() {
  try {
    const result = await chrome.storage.local.get(['lastUsed']);
    const lastUsed = result.lastUsed || 0;
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    // Clear old product images if not used recently
    if (lastUsed < oneHourAgo) {
      await chrome.storage.local.remove(['currentProductImage', 'currentPageUrl']);
      console.log('Cleaned up old product image data');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run cleanup when extension starts
chrome.runtime.onStartup.addListener(() => {
  cleanupOldData();
});