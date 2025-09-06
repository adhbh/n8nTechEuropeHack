// Popup script for Virtual Try-On Extension

// Inline configuration to avoid loading issues
const CONFIG = {
  // n8n webhook endpoint URL - replace with your actual webhook URL
  N8N_WEBHOOK_URL: 'https://adhbh.app.n8n.cloud/webhook-test/743abfa1-9a3d-4830-a202-26297efa8d47',
  
  // API timeout in milliseconds
  API_TIMEOUT: 30000,
  
  // Supported image formats
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'],
  
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024
};

class VirtualTryOnPopup {
  constructor() {
    this.productImageUrl = null;
    this.userImageFile = null;
    this.userImageDataUrl = null;
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadProductImage();
  }

  initializeElements() {
    // Get all DOM elements
    this.elements = {
      productSection: document.getElementById('productSection'),
      productImage: document.getElementById('productImage'),
      uploadArea: document.getElementById('uploadArea'),
      fileInput: document.getElementById('fileInput'),
      userImagePreview: document.getElementById('userImagePreview'),
      userImage: document.getElementById('userImage'),
      changePhotoBtn: document.getElementById('changePhotoBtn'),
      tryOnBtn: document.getElementById('tryOnBtn'),
      resetBtn: document.getElementById('resetBtn'),
      btnText: document.querySelector('.btn-text'),
      btnLoader: document.querySelector('.btn-loader'),
      resultsSection: document.getElementById('resultsSection'),
      resultImage: document.getElementById('resultImage'),
      downloadBtn: document.getElementById('downloadBtn'),
      tryAgainBtn: document.getElementById('tryAgainBtn'),
      errorSection: document.getElementById('errorSection'),
      errorMessage: document.getElementById('errorMessage'),
      retryBtn: document.getElementById('retryBtn'),
      loadingSection: document.getElementById('loadingSection')
    };
  }

  attachEventListeners() {
    console.log('🎯 Popup: Attaching event listeners');
    
    // Upload area click
    this.elements.uploadArea.addEventListener('click', (e) => {
      console.log('🎯 Popup: Upload area click event triggered');
      console.log('🎯 Popup: Event target:', e.target);
      console.log('🎯 Popup: Event type:', e.type);
      
      // Also send message to content script so it appears in main console
      this.sendDebugMessage('Upload area clicked');
      
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🎯 Popup: About to trigger file input click');
      console.log('🎯 Popup: File input element:', this.elements.fileInput);
      
      try {
        this.elements.fileInput.click();
        console.log('🎯 Popup: File input click triggered successfully');
        this.sendDebugMessage('File input click triggered');
      } catch (error) {
        console.error('🎯 Popup: Error triggering file input click:', error);
        this.sendDebugMessage('Error triggering file input: ' + error.message);
      }
    });

    // File input change
    this.elements.fileInput.addEventListener('change', (e) => {
      console.log('🎯 Popup: File input change event triggered');
      console.log('🎯 Popup: Event target:', e.target);
      console.log('🎯 Popup: Files:', e.target.files);
      console.log('🎯 Popup: Files length:', e.target.files ? e.target.files.length : 0);
      
      e.preventDefault();
      e.stopPropagation();
      
      if (e.target.files && e.target.files[0]) {
        console.log('🎯 Popup: File found, calling handleFileSelect');
        this.handleFileSelect(e.target.files[0]);
      } else {
        console.log('🎯 Popup: No file found in change event');
      }
    });

    // Add focus/blur listeners to file input
    this.elements.fileInput.addEventListener('focus', (e) => {
      console.log('🎯 Popup: File input focused');
    });

    this.elements.fileInput.addEventListener('blur', (e) => {
      console.log('🎯 Popup: File input blurred');
    });

    // Drag and drop
    this.elements.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.elements.uploadArea.classList.add('drag-over');
    });

    this.elements.uploadArea.addEventListener('dragleave', () => {
      this.elements.uploadArea.classList.remove('drag-over');
    });

    this.elements.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.elements.uploadArea.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) {
        this.handleFileSelect(file);
      }
    });

    // Change photo button
    this.elements.changePhotoBtn.addEventListener('click', () => {
      this.resetUserImage();
    });

    // Try-on button
    this.elements.tryOnBtn.addEventListener('click', () => {
      this.performVirtualTryOn();
    });

    // Reset button
    this.elements.resetBtn.addEventListener('click', () => {
      this.resetAll();
    });

    // Download button
    this.elements.downloadBtn.addEventListener('click', () => {
      this.downloadResult();
    });

    // Try again button
    this.elements.tryAgainBtn.addEventListener('click', () => {
      this.resetToUpload();
    });

    // Retry button
    this.elements.retryBtn.addEventListener('click', () => {
      this.hideError();
      this.resetToUpload();
    });
  }

  async loadProductImage() {
    console.log('🎯 Popup: loadProductImage called');
    
    try {
      console.log('🎯 Popup: Getting data from chrome storage');
      // Get product image URL and user image from storage
      const result = await chrome.storage.local.get(['currentProductImage', 'currentUserImage', 'currentUserImageFile']);
      
      console.log('🎯 Popup: Storage result:', {
        hasProductImage: !!result.currentProductImage,
        hasUserImage: !!result.currentUserImage,
        productImageLength: result.currentProductImage ? result.currentProductImage.length : 0,
        userImageLength: result.currentUserImage ? result.currentUserImage.length : 0
      });
      
      if (result.currentProductImage) {
        console.log('🎯 Popup: Setting product image from storage');
        this.productImageUrl = result.currentProductImage;
        this.elements.productImage.src = this.productImageUrl;
        this.elements.productSection.style.display = 'block';
        console.log('🎯 Popup: Product image loaded from storage successfully');
      } else {
        console.log('🎯 Popup: No product image found in storage');
      }
      
      // Restore user image if it exists
      if (result.currentUserImage) {
        console.log('🎯 Popup: Restoring user image from storage');
        this.userImageDataUrl = result.currentUserImage;
        console.log('🎯 Popup: Setting user image src');
        this.elements.userImage.src = this.userImageDataUrl;
        console.log('🎯 Popup: Calling showUserImagePreview from loadProductImage');
        this.showUserImagePreview();
        console.log('🎯 Popup: User image restored from storage successfully');
      } else {
        console.log('🎯 Popup: No user image found in storage');
      }
      
      // Update button state
      console.log('🎯 Popup: Updating button state from loadProductImage');
      this.updateTryOnButton();
      console.log('🎯 Popup: loadProductImage completed successfully');
      
    } catch (error) {
      console.error('🎯 Popup: Error in loadProductImage:', error);
      console.error('🎯 Popup: loadProductImage error stack:', error.stack);
    }
  }

  async handleFileSelect(file) {
    console.log('🎯 Popup: handleFileSelect called with file:', file);
    
    if (!file) {
      console.log('🎯 Popup: No file provided');
      return;
    }

    console.log('🎯 Popup: File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
      console.log('🎯 Popup: Invalid file type:', file.type);
      this.showError('Please select a JPG or PNG image file.');
      return;
    }

    // Validate file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      console.log('🎯 Popup: File too large:', file.size);
      this.showError('File size must be less than 5MB.');
      return;
    }

    console.log('🎯 Popup: File validation passed');
    this.userImageFile = file;

    // Create preview
    const reader = new FileReader();
    
    reader.onloadstart = (e) => {
      console.log('🎯 Popup: FileReader onloadstart triggered');
    };
    
    reader.onprogress = (e) => {
      console.log('🎯 Popup: FileReader onprogress:', e.loaded, '/', e.total);
    };
    
    reader.onload = async (e) => {
      console.log('🎯 Popup: FileReader onload triggered');
      console.log('🎯 Popup: FileReader result length:', e.target.result ? e.target.result.length : 0);
      
      try {
        this.userImageDataUrl = e.target.result;
        console.log('🎯 Popup: userImageDataUrl set, length:', this.userImageDataUrl.length);
        
        console.log('🎯 Popup: Setting image src');
        this.elements.userImage.src = this.userImageDataUrl;
        console.log('🎯 Popup: Image src set successfully');
        
        console.log('🎯 Popup: Calling showUserImagePreview');
        this.showUserImagePreview();
        console.log('🎯 Popup: showUserImagePreview completed');
        
        console.log('🎯 Popup: Calling updateTryOnButton');
        this.updateTryOnButton();
        console.log('🎯 Popup: updateTryOnButton completed');
        
        // Save user image to storage so it persists when popup reopens
        console.log('🎯 Popup: About to save to chrome storage');
        try {
          await chrome.storage.local.set({
            currentUserImage: this.userImageDataUrl
          });
          console.log('🎯 Popup: User image saved to storage successfully');
          
          // Verify it was saved
          const verification = await chrome.storage.local.get(['currentUserImage']);
          console.log('🎯 Popup: Storage verification - image exists:', !!verification.currentUserImage);
          console.log('🎯 Popup: Storage verification - image length:', verification.currentUserImage ? verification.currentUserImage.length : 0);
          
        } catch (storageError) {
          console.error('🎯 Popup: Error saving user image to storage:', storageError);
          console.error('🎯 Popup: Storage error stack:', storageError.stack);
        }
        
      } catch (processError) {
        console.error('🎯 Popup: Error processing file:', processError);
        console.error('🎯 Popup: Process error stack:', processError.stack);
      }
    };
    
    reader.onloadend = (e) => {
      console.log('🎯 Popup: FileReader onloadend triggered');
    };
    
    reader.onerror = (error) => {
      console.error('🎯 Popup: FileReader error:', error);
      console.error('🎯 Popup: FileReader error details:', reader.error);
    };
    
    reader.onabort = (e) => {
      console.log('🎯 Popup: FileReader onabort triggered');
    };
    
    console.log('🎯 Popup: Starting to read file as data URL');
    console.log('🎯 Popup: File details before reading:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    try {
      reader.readAsDataURL(file);
      console.log('🎯 Popup: readAsDataURL called successfully');
    } catch (readerError) {
      console.error('🎯 Popup: Error calling readAsDataURL:', readerError);
    }
  }

  showUserImagePreview() {
    console.log('🎯 Popup: showUserImagePreview called');
    console.log('🎯 Popup: uploadArea element:', this.elements.uploadArea);
    console.log('🎯 Popup: userImagePreview element:', this.elements.userImagePreview);
    
    try {
      console.log('🎯 Popup: Hiding upload area');
      this.elements.uploadArea.style.display = 'none';
      console.log('🎯 Popup: Upload area hidden');
      
      console.log('🎯 Popup: Showing user image preview');
      this.elements.userImagePreview.style.display = 'block';
      console.log('🎯 Popup: User image preview shown');
      
      console.log('🎯 Popup: showUserImagePreview completed successfully');
    } catch (error) {
      console.error('🎯 Popup: Error in showUserImagePreview:', error);
      console.error('🎯 Popup: showUserImagePreview error stack:', error.stack);
    }
  }

  async resetUserImage() {
    this.userImageFile = null;
    this.userImageDataUrl = null;
    this.elements.userImagePreview.style.display = 'none';
    this.elements.uploadArea.style.display = 'block';
    this.elements.fileInput.value = '';
    this.updateTryOnButton();
    
    // Clear user image from storage
    try {
      await chrome.storage.local.remove(['currentUserImage']);
      console.log('🎯 Popup: User image cleared from storage');
    } catch (error) {
      console.error('Error clearing user image from storage:', error);
    }
  }

  updateTryOnButton() {
    const hasUserImage = this.userImageDataUrl !== null;
    const hasProductImage = this.productImageUrl !== null;
    this.elements.tryOnBtn.disabled = !(hasUserImage && hasProductImage);
    
    console.log('🎯 Popup: Button state updated', {
      hasUserImage,
      hasProductImage,
      disabled: this.elements.tryOnBtn.disabled
    });
  }

  async performVirtualTryOn() {
    if (!this.userImageDataUrl || !this.productImageUrl) {
      this.showError('Please select both a user photo and product image.');
      return;
    }

    console.log('🎯 Popup: Starting virtual try-on process');
    this.showLoading();

    try {
      // Get page URL
      const pageUrl = await this.getCurrentPageUrl();
      
      // Convert user image to base64 (remove data:image/jpeg;base64, prefix)
      const userImageBase64 = this.userImageDataUrl.split(',')[1];
      
      // Convert product image to base64
      console.log('🎯 Popup: Converting product image to base64...');
      const productImageBase64 = await this.urlToBase64(this.productImageUrl);

      // Prepare request data
      const requestData = {
        userImageBase64: userImageBase64,
        productImageBase64: productImageBase64,
        productImageUrl: this.productImageUrl, // Keep original URL as well
        pageUrl: pageUrl
      };

      // Log detailed request information
      console.log('🎯 Popup: === REQUEST DETAILS ===');
      console.log('🎯 Popup: Request URL:', CONFIG.N8N_WEBHOOK_URL);
      console.log('🎯 Popup: Request Method: POST');
      console.log('🎯 Popup: Request Headers: Content-Type: application/json');
      
      // Log request body details
      console.log('🎯 Popup: === REQUEST BODY DETAILS ===');
      console.log('🎯 Popup: userImageBase64 length:', userImageBase64.length);
      console.log('🎯 Popup: productImageBase64 length:', productImageBase64.length);
      console.log('🎯 Popup: productImageUrl:', this.productImageUrl);
      console.log('🎯 Popup: pageUrl:', pageUrl);
      
      // Log first 100 characters of base64 strings for verification
      console.log('🎯 Popup: userImageBase64 preview:', userImageBase64.substring(0, 100) + '...');
      console.log('🎯 Popup: productImageBase64 preview:', productImageBase64.substring(0, 100) + '...');
      
      // Log FULL base64 strings for copying
      console.log('🎯 Popup: === FULL BASE64 STRINGS (COPYABLE) ===');
      console.log('🎯 Popup: FULL userImageBase64:');
      console.log(userImageBase64);
      console.log('🎯 Popup: FULL productImageBase64:');
      console.log(productImageBase64);
      
      console.log('🎯 Popup: === FULL REQUEST BODY ===');
      console.log('🎯 Popup: Request body:', JSON.stringify({
        ...requestData,
        userImageBase64: userImageBase64.substring(0, 50) + '... (truncated)',
        productImageBase64: productImageBase64.substring(0, 50) + '... (truncated)'
      }, null, 2));
      
      console.log('🎯 Popup: === SENDING REQUEST ===');

      // Send request to n8n webhook
      const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('🎯 Popup: Received response:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎯 Popup: Response data:', result);
      
      // Handle the response - check for different response formats
      let resultImageUrl = null;
      let isBase64Image = false;
      
      if (result.data) {
        // New format: {data: "Image in base64"}
        console.log('🎯 Popup: Using new format result.data (base64)');
        resultImageUrl = `data:image/jpeg;base64,${result.data}`;
        isBase64Image = true;
        console.log('🎯 Popup: Base64 image length:', result.data.length);
      } else if (result.success && result.resultImageUrl) {
        // Original expected format
        resultImageUrl = result.resultImageUrl;
        console.log('🎯 Popup: Using result.resultImageUrl:', resultImageUrl);
      } else if (result.result && result.result.sample) {
        // n8n webhook format with result.sample
        resultImageUrl = result.result.sample;
        console.log('🎯 Popup: Using result.result.sample:', resultImageUrl);
      } else if (result.sample) {
        // Direct sample format
        resultImageUrl = result.sample;
        console.log('🎯 Popup: Using result.sample:', resultImageUrl);
      }
      
      if (resultImageUrl) {
        console.log('🎯 Popup: Showing result with image:', isBase64Image ? 'base64 data' : resultImageUrl);
        this.showResult(resultImageUrl);
      } else {
        console.error('🎯 Popup: No valid image URL or data found in response');
        throw new Error(result.error || result.details || 'Failed to generate virtual try-on - no image data in response');
      }

    } catch (error) {
      console.error('🎯 Popup: Virtual try-on error:', error);
      this.showError(`Failed to generate virtual try-on: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  // Convert image URL to base64
  async urlToBase64(url) {
    try {
      console.log('🎯 Popup: Fetching image from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('🎯 Popup: Image blob size:', blob.size, 'type:', blob.type);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Remove the data:image/jpeg;base64, prefix
          const base64 = reader.result.split(',')[1];
          console.log('🎯 Popup: Image converted to base64, length:', base64.length);
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('🎯 Popup: Error converting URL to base64:', error);
      throw error;
    }
  }

  // Helper function to convert data URL to File object
  async dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async getCurrentPageUrl() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab.url;
    } catch (error) {
      console.error('Error getting current page URL:', error);
      return '';
    }
  }

  showLoading() {
    this.hideAllSections();
    this.elements.loadingSection.style.display = 'block';
    this.elements.tryOnBtn.disabled = true;
    this.elements.btnText.style.display = 'none';
    this.elements.btnLoader.style.display = 'inline';
  }

  hideLoading() {
    this.elements.loadingSection.style.display = 'none';
    this.elements.tryOnBtn.disabled = false;
    this.elements.btnText.style.display = 'inline';
    this.elements.btnLoader.style.display = 'none';
  }

  showResult(resultImageUrl) {
    this.hideAllSections();
    this.elements.resultImage.src = resultImageUrl;
    this.elements.resultsSection.style.display = 'block';
  }

  showError(message) {
    this.hideAllSections();
    this.elements.errorMessage.textContent = message;
    this.elements.errorSection.style.display = 'block';
  }

  hideError() {
    this.elements.errorSection.style.display = 'none';
  }

  hideAllSections() {
    this.elements.resultsSection.style.display = 'none';
    this.elements.errorSection.style.display = 'none';
    this.elements.loadingSection.style.display = 'none';
  }

  resetToUpload() {
    this.hideAllSections();
    this.resetUserImage();
    this.updateTryOnButton();
  }

  downloadResult() {
    const resultImageSrc = this.elements.resultImage.src;
    if (resultImageSrc) {
      // Create download link
      const link = document.createElement('a');
      link.href = resultImageSrc;
      link.download = `virtual-tryon-result-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Reset all images and data
  async resetAll() {
    console.log('🎯 Popup: resetAll called');
    
    try {
      // Reset user image
      this.userImageFile = null;
      this.userImageDataUrl = null;
      this.elements.userImagePreview.style.display = 'none';
      this.elements.uploadArea.style.display = 'block';
      this.elements.fileInput.value = '';
      
      // Reset product image
      this.productImageUrl = null;
      this.elements.productImage.src = '';
      this.elements.productSection.style.display = 'none';
      
      // Hide all sections
      this.hideAllSections();
      
      // Update button state
      this.updateTryOnButton();
      
      // Clear storage
      await chrome.storage.local.remove(['currentProductImage', 'currentUserImage']);
      console.log('🎯 Popup: All data cleared from storage');
      
      console.log('🎯 Popup: Reset completed successfully');
      
    } catch (error) {
      console.error('🎯 Popup: Error in resetAll:', error);
    }
  }

  // Helper method to send debug messages to content script
  sendDebugMessage(message) {
    try {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'debugLog',
            message: `🎯 Popup Debug: ${message}`
          });
        }
      });
    } catch (error) {
      console.log('Could not send debug message:', error);
    }
  }
}

// Add extensive logging for popup lifecycle
console.log('🎯 Popup: Script execution started');

// Track all events that might cause popup to close
window.addEventListener('beforeunload', (e) => {
  console.log('🎯 Popup: beforeunload event triggered');
});

window.addEventListener('unload', (e) => {
  console.log('🎯 Popup: unload event triggered');
});

window.addEventListener('pagehide', (e) => {
  console.log('🎯 Popup: pagehide event triggered');
});

window.addEventListener('blur', (e) => {
  console.log('🎯 Popup: window blur event triggered, target:', e.target);
});

window.addEventListener('focus', (e) => {
  console.log('🎯 Popup: window focus event triggered, target:', e.target);
});

document.addEventListener('visibilitychange', () => {
  console.log('🎯 Popup: visibility changed to:', document.visibilityState);
});

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Popup: DOM Content Loaded');
  console.log('🎯 Popup: Document ready state:', document.readyState);
  console.log('🎯 Popup: Window location:', window.location.href);
  
  try {
    const popup = new VirtualTryOnPopup();
    window.virtualTryOnPopup = popup;
    console.log('🎯 Popup: VirtualTryOnPopup initialized successfully');
    
    // Log all elements found
    console.log('🎯 Popup: Elements found:', {
      uploadArea: !!popup.elements.uploadArea,
      fileInput: !!popup.elements.fileInput,
      userImagePreview: !!popup.elements.userImagePreview,
      productSection: !!popup.elements.productSection
    });
    
  } catch (error) {
    console.error('🎯 Popup: Error initializing VirtualTryOnPopup:', error);
    console.error('🎯 Popup: Error stack:', error.stack);
    // Show a basic error message in the popup
    document.body.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
        <h3>Error Loading Popup</h3>
        <p>Error: ${error.message}</p>
        <p>Please check the console for more details.</p>
      </div>
    `;
  }
});

// Add error handler for any uncaught errors
window.addEventListener('error', (event) => {
  console.error('🎯 Popup: Uncaught error:', event.error);
});

// Add basic debugging
console.log('🎯 Popup: popup.js loaded');

// Prevent popup from closing during file operations
document.addEventListener('click', (e) => {
  // Don't prevent default for file input clicks
  if (e.target.id !== 'fileInput') {
    e.stopPropagation();
  }
});

// Keep popup alive with periodic pings
setInterval(() => {
  console.log('🎯 Popup: Keepalive ping');
}, 10000);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setProductImage') {
    // Store product image URL
    chrome.storage.local.set({ currentProductImage: request.productImageUrl });
    
    // Update UI if popup is already loaded
    const popup = window.virtualTryOnPopup;
    if (popup) {
      popup.productImageUrl = request.productImageUrl;
      popup.elements.productImage.src = request.productImageUrl;
      popup.elements.productSection.style.display = 'block';
      popup.updateTryOnButton();
    }
    
    sendResponse({ success: true });
  }
});