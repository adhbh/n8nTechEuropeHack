// Configuration file for Virtual Try-On Extension
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}