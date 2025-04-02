import logger from '../logger.js';

/**
 * Optimize an image by resizing and compressing it
 * @param {File} file - The original image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {Promise<File>} - The optimized image file
 */
export const optimizeImage = async (file, maxWidth = 1200, maxSizeMB = 2) => {
  // If not an image or already small enough, return original
  if (!file.type.startsWith('image/') || file.size <= maxSizeMB * 0.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = Math.round(height * ratio);
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with high quality
          let quality = 0.8;
          const tryCompress = (currentQuality) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to create image blob'));
                  return;
                }
                
                // If still too large and quality can be reduced further, try again
                if (blob.size > maxSizeMB * 1024 * 1024 && currentQuality > 0.2) {
                  tryCompress(currentQuality - 0.1);
                  return;
                }
                
                // Create new file from blob
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                
                logger.info(`Image optimized: ${file.size} → ${optimizedFile.size} bytes (${Math.round((1 - optimizedFile.size / file.size) * 100)}% reduction)`);
                resolve(optimizedFile);
              },
              'image/jpeg',
              currentQuality
            );
          };
          
          // Start compression
          tryCompress(quality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    } catch (error) {
      logger.error('Image optimization error:', error);
      // Fall back to original file on error
      resolve(file);
    }
  });
};

/**
 * Validates an image file
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file) {
    return { valid: false, error: "No file provided" };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `Image too large (max ${maxSize/1024/1024}MB)` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type (must be JPEG, PNG, GIF or WebP)" };
  }
  
  return { valid: true };
};

/**
 * Creates a preview URL for an image file
 * @param {File} file - The image file
 * @returns {Promise<string>} - Preview URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to create image preview'));
    reader.readAsDataURL(file);
  });
};
