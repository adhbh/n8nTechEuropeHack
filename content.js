// Content script to inject Virtual Try-On buttons on e-commerce sites

// Inline configuration to avoid CSP issues
const CONFIG = {
  // n8n webhook endpoint URL - replace with your actual webhook URL
  N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/virtual-tryon',
  
  // API timeout in milliseconds
  API_TIMEOUT: 30000,
  
  // Supported image formats
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'],
  
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Selectors for different e-commerce sites
  PRODUCT_IMAGE_SELECTORS: {
    zalando: [
      // Current Zalando layout selectors
      'img[src*="ztat.net"]',
      'img[src*="zalando"]',
      'img[alt*="FASHION SUIT"]',
      'img[alt*="Suit"]',
      'img[alt*="suit"]',
      'img[alt*="Anzug"]',
      'img[alt*="anzug"]',
      // Generic product image selectors
      'img[data-testid*="product"]',
      'img[data-testid*="gallery"]',
      'img[data-testid*="image"]',
      '.voFjEy',
      // Fallback selectors
      'img[width="762"]',
      'img[width="1800"]',
      'img[class*="product"]',
      'img[class*="gallery"]',
      'img[class*="main"]',
      // Legacy selectors
      'img[data-testid*="product_gallery-hover-zoom-image"]',
      '.product-image img',
      '.pdp-image img',
      '.gallery-image img',
      '[data-testid="pdp-gallery"] img'
    ],
    amazon: [
      '#landingImage',
      '.a-dynamic-image',
      '#imgBlkFront',
      '.item-image img'
    ],
    hm: [
      '.product-detail-main-image img',
      '.product-image img',
      '.pdp-image img'
    ],
    zara: [
      '.media-image img',
      '.product-detail-image img',
      '.product-image img'
    ],
    asos: [
      '.gallery-image img',
      '.product-image img',
      '.pdp-image img'
    ],
    nike: [
      '.product-image img',
      '.pdp-image img',
      '.hero-image img'
    ],
    adidas: [
      '.product-image img',
      '.pdp-image img',
      '.hero-image img'
    ],
    default: [
      'img[alt*="product"]',
      'img[class*="product"]',
      'img[data-testid*="product"]',
      '.product img',
      '.item img'
    ]
  }
};

// Initialize immediately
initializeVirtualTryOn();

// Initialize the virtual try-on functionality
function initializeVirtualTryOn() {
  console.log('🚀 Virtual Try-On: Initializing extension...');
  
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 Virtual Try-On: DOM Content Loaded');
      injectButtons();
    });
  } else {
    console.log('📄 Virtual Try-On: Document already ready');
    injectButtons();
  }

  // Try multiple times with delays to catch dynamically loaded content
  setTimeout(() => {
    console.log('⏰ Virtual Try-On: Retry injection after 2s');
    injectButtons();
  }, 2000);
  
  setTimeout(() => {
    console.log('⏰ Virtual Try-On: Retry injection after 5s');
    injectButtons();
  }, 5000);

  // Also watch for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes contain images
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const hasImages = node.tagName === 'IMG' || node.querySelector('img');
            if (hasImages) {
              shouldInject = true;
            }
          }
        });
      }
    });
    if (shouldInject) {
      console.log('🔄 Virtual Try-On: DOM mutation detected, re-injecting buttons');
      setTimeout(injectButtons, 1000); // Delay to allow content to settle
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Inject Virtual Try-On buttons next to product images
function injectButtons() {
  console.log('🔍 Virtual Try-On: Starting button injection...');
  const productImages = findProductImages();
  
  console.log(`🔍 Virtual Try-On: Found ${productImages.length} product images`);
  
  productImages.forEach((img, index) => {
    console.log(`🔍 Virtual Try-On: Processing image ${index + 1}:`, {
      src: img.src,
      alt: img.alt,
      testId: img.dataset.testid,
      classes: img.className,
      dimensions: `${img.offsetWidth}x${img.offsetHeight}`
    });
    
    // Skip if button already exists
    if (img.parentElement.querySelector('.virtual-tryon-btn')) {
      console.log(`⚠️ Virtual Try-On: Button already exists for image ${index + 1}`);
      return;
    }

    // Create the Virtual Try-On button
    const button = createVirtualTryButton(img, index);
    
    // Insert button near the image
    insertButtonNearImage(img, button);
    console.log(`✅ Virtual Try-On: Button injected for image ${index + 1}`);
  });
}

// Find product images on the current page
function findProductImages() {
  const images = [];
  const hostname = window.location.hostname.toLowerCase();
  
  console.log(`🔍 Virtual Try-On: Searching for images on ${hostname}`);
  
  // Determine site type
  let siteType = 'default';
  if (hostname.includes('zalando')) siteType = 'zalando';
  else if (hostname.includes('amazon')) siteType = 'amazon';
  else if (hostname.includes('hm') || hostname.includes('h-m')) siteType = 'hm';
  else if (hostname.includes('zara')) siteType = 'zara';
  else if (hostname.includes('asos')) siteType = 'asos';
  else if (hostname.includes('nike')) siteType = 'nike';
  else if (hostname.includes('adidas')) siteType = 'adidas';

  console.log(`🔍 Virtual Try-On: Detected site type: ${siteType}`);

  // Get selectors for this site
  const selectors = CONFIG.PRODUCT_IMAGE_SELECTORS[siteType] || CONFIG.PRODUCT_IMAGE_SELECTORS.default;
  
  console.log(`🔍 Virtual Try-On: Using selectors:`, selectors);
  
  // Find images using selectors
  selectors.forEach((selector, selectorIndex) => {
    console.log(`🔍 Virtual Try-On: Trying selector ${selectorIndex + 1}: "${selector}"`);
    const foundImages = document.querySelectorAll(selector);
    console.log(`🔍 Virtual Try-On: Found ${foundImages.length} elements with selector "${selector}"`);
    
    foundImages.forEach((img, imgIndex) => {
      console.log(`🔍 Virtual Try-On: Checking image ${imgIndex + 1} from selector "${selector}":`, {
        tagName: img.tagName,
        src: img.src,
        alt: img.alt,
        testId: img.dataset.testid,
        dimensions: `${img.offsetWidth}x${img.offsetHeight}`,
        classes: img.className
      });
      
      // For Zalando, be more selective - only target main product images
      if (siteType === 'zalando') {
        // Only include images that are large enough to be main product images (not thumbnails)
        if (img.offsetWidth > 200 && img.offsetHeight > 200) {
          console.log(`✅ Virtual Try-On: Image ${imgIndex + 1} passes main image size check for Zalando`);
          if (isMainProductImage(img)) {
            console.log(`✅ Virtual Try-On: Image ${imgIndex + 1} is identified as main product image`);
            images.push(img);
          } else {
            console.log(`❌ Virtual Try-On: Image ${imgIndex + 1} failed main product image check`);
          }
        } else {
          console.log(`❌ Virtual Try-On: Image ${imgIndex + 1} too small for main image (${img.offsetWidth}x${img.offsetHeight})`);
        }
      } else {
        // For other sites, use the original logic
        if (img.offsetWidth > 100 && img.offsetHeight > 100) {
          console.log(`✅ Virtual Try-On: Image ${imgIndex + 1} passes size check`);
          if (isProductImage(img)) {
            console.log(`✅ Virtual Try-On: Image ${imgIndex + 1} passes product image check`);
            images.push(img);
          } else {
            console.log(`❌ Virtual Try-On: Image ${imgIndex + 1} failed product image check`);
          }
        } else {
          console.log(`❌ Virtual Try-On: Image ${imgIndex + 1} too small (${img.offsetWidth}x${img.offsetHeight})`);
        }
      }
    });
  });

  // Remove duplicates and for Zalando, only return the first (main) image
  let uniqueImages = [...new Set(images)];
  
  if (siteType === 'zalando' && uniqueImages.length > 1) {
    console.log(`🔍 Virtual Try-On: Multiple images found for Zalando, selecting only the main image`);
    uniqueImages = [uniqueImages[0]]; // Only keep the first (main) image
  }
  
  console.log(`🔍 Virtual Try-On: Final result: ${uniqueImages.length} unique product images found`);
  return uniqueImages;
}

// Check if an image is the main product image (for Zalando)
function isMainProductImage(img) {
  // Check if this is in the main product view area (not thumbnail area)
  const testId = img.dataset.testid || '';
  
  // Main product images typically have specific test IDs or are in specific containers
  if (testId.includes('product_gallery-hover-zoom-image')) {
    // Check if this is the currently displayed main image (usually index 0 or active)
    const container = img.closest('[role="tabpanel"]');
    if (container && container.id && container.id.includes('tab-panel')) {
      return true;
    }
  }
  
  // Additional checks for main product image
  const imgSrc = img.src || '';
  
  // Main images usually have larger dimensions in the URL
  if (imgSrc.includes('imwidth=1800') || imgSrc.includes('imwidth=762')) {
    return true;
  }
  
  // Check if image is in the main product display area (not thumbnail list)
  const parentContainer = img.closest('ul');
  if (parentContainer && parentContainer.getAttribute('aria-hidden') === 'true') {
    return false; // This is likely a thumbnail list
  }
  
  return true;
}

// Check if an image is likely a product image
function isProductImage(img) {
  const src = img.src || img.dataset.src || '';
  const alt = img.alt || '';
  
  // Skip if no source
  if (!src) return false;
  
  // Skip common non-product images
  const skipPatterns = [
    'logo', 'icon', 'banner', 'ad', 'advertisement',
    'header', 'footer', 'nav', 'menu', 'social'
  ];
  
  const lowerSrc = src.toLowerCase();
  const lowerAlt = alt.toLowerCase();
  
  for (const pattern of skipPatterns) {
    if (lowerSrc.includes(pattern) || lowerAlt.includes(pattern)) {
      return false;
    }
  }
  
  return true;
}

// Create Virtual Try-On button
function createVirtualTryButton(img, index) {
  const button = document.createElement('button');
  button.className = 'virtual-tryon-btn';
  button.innerHTML = '👕 Virtual Try';
  button.title = 'Try this item virtually';
  button.dataset.imageIndex = index;
  button.dataset.imageSrc = img.src || img.dataset.src;
  
  // Add click handler
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleVirtualTryClick(button);
  });
  
  return button;
}

// Insert button near the image
function insertButtonNearImage(img, button) {
  // For Zalando, we need to find the right container
  // Structure: button > div > div > img
  // We want to add our button to the same level as the existing button
  
  let targetContainer = img.parentElement;
  
  // Navigate up to find the button container that wraps the image
  let attempts = 0;
  while (targetContainer && attempts < 5) {
    if (targetContainer.tagName === 'BUTTON' && targetContainer.getAttribute('aria-haspopup') === 'dialog') {
      // Found the button that contains the image, use its parent
      targetContainer = targetContainer.parentElement;
      break;
    }
    targetContainer = targetContainer.parentElement;
    attempts++;
  }
  
  // Fallback to image's immediate parent
  if (!targetContainer) {
    targetContainer = img.parentElement;
  }
  
  if (targetContainer) {
    // Create a wrapper div for the button
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'virtual-tryon-wrapper';
    buttonWrapper.appendChild(button);
    
    // Position the button overlay on the image
    buttonWrapper.style.cssText = `
      position: absolute !important;
      top: 10px !important;
      right: 10px !important;
      z-index: 9999 !important;
      pointer-events: auto !important;
    `;
    
    // Make sure the container has relative positioning
    const containerStyle = getComputedStyle(targetContainer);
    if (containerStyle.position === 'static') {
      targetContainer.style.position = 'relative';
    }
    
    targetContainer.appendChild(buttonWrapper);
    
    console.log(`✅ Virtual Try-On: Button wrapper inserted into container:`, {
      containerTag: targetContainer.tagName,
      containerClass: targetContainer.className,
      containerPosition: getComputedStyle(targetContainer).position,
      imageAlt: img.alt,
      imageSrc: img.src
    });
  } else {
    console.error('❌ Virtual Try-On: Could not find suitable container for button');
  }
}

// Handle Virtual Try button click
function handleVirtualTryClick(button) {
  console.log('🔥 Virtual Try-On: Button clicked!');
  const imageSrc = button.dataset.imageSrc;
  
  console.log('🔥 Virtual Try-On: Image source:', imageSrc);
  console.log('🔥 Virtual Try-On: Page URL:', window.location.href);
  
  // Send message to background script to open popup with image data
  chrome.runtime.sendMessage({
    action: 'openVirtualTry',
    productImageUrl: imageSrc,
    pageUrl: window.location.href
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Virtual Try-On: Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('✅ Virtual Try-On: Message sent successfully:', response);
      
      // Always show user feedback when message is successful
      console.log('🔔 Virtual Try-On: Creating notification...');
      
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.id = 'virtual-tryon-notification';
      notification.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: #4CAF50 !important;
        color: white !important;
        padding: 15px 25px !important;
        border-radius: 8px !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        border: 2px solid #45a049 !important;
        animation: slideIn 0.3s ease-out !important;
        pointer-events: auto !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">✅</span>
          <span>Product saved! Click the extension icon to continue.</span>
        </div>
      `;
      
      // Add animation keyframes
      if (!document.getElementById('virtual-tryon-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'virtual-tryon-notification-styles';
        style.textContent = `
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Remove any existing notification
      const existingNotification = document.getElementById('virtual-tryon-notification');
      if (existingNotification) {
        existingNotification.remove();
      }
      
      document.body.appendChild(notification);
      console.log('🔔 Virtual Try-On: Notification added to DOM');
      
      // Remove notification after 6 seconds
      setTimeout(() => {
        if (notification && notification.parentNode) {
          notification.style.animation = 'slideOut 0.3s ease-in forwards';
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification);
              console.log('🔔 Virtual Try-On: Notification removed');
            }
          }, 300);
        }
      }, 6000);
    }
  });
}

// Add styles for the button
function addButtonStyles() {
  if (document.getElementById('virtual-tryon-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'virtual-tryon-styles';
  style.textContent = `
    .virtual-tryon-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
      border: none !important;
      padding: 8px 12px !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
      transition: all 0.3s ease !important;
      white-space: nowrap !important;
      z-index: 1001 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      line-height: 1 !important;
      text-decoration: none !important;
      display: inline-block !important;
      position: relative !important;
    }
    
    .virtual-tryon-btn:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
    }
    
    .virtual-tryon-wrapper {
      pointer-events: auto !important;
      position: absolute !important;
      z-index: 1000 !important;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize styles
addButtonStyles();

// Export for testing
if (typeof window !== 'undefined') {
  window.VirtualTryOn = {
    injectButtons,
    findProductImages,
    createVirtualTryButton
  };
}