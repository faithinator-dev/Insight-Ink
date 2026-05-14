// File to Base64 converter utility
// Handles file uploads and converts them to base64 strings

const fs = require('fs');
const path = require('path');

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
    profilePicture: 2 * 1024 * 1024,    // 2MB
    postImage: 5 * 1024 * 1024,         // 5MB
    inlineImage: 3 * 1024 * 1024,       // 3MB
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

/**
 * Convert file buffer to base64 string with data URI
 * @param {Buffer} fileBuffer - The file buffer
 * @param {String} mimeType - MIME type of file (e.g., 'image/jpeg')
 * @returns {String} Data URI string (e.g., 'data:image/jpeg;base64,...')
 */
function bufferToBase64(fileBuffer, mimeType) {
    const base64 = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

/**
 * Validate and convert file to base64
 * @param {Object} file - Express file object from req.file or req.files
 * @param {String} fileType - Type of file (profilePicture, postImage, inlineImage)
 * @returns {Object} { success: boolean, data: base64String or error: errorMessage }
 */
function fileToBase64(file, fileType = 'postImage') {
    try {
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Check file type
        if (!ALLOWED_MIME_TYPES[file.mimetype]) {
            return { success: false, error: 'Only JPG, PNG, WebP, and GIF images allowed' };
        }

        // Check file size
        const maxSize = MAX_FILE_SIZES[fileType] || MAX_FILE_SIZES.postImage;
        if (file.size > maxSize) {
            return { success: false, error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` };
        }

        // Convert to base64
        const base64 = bufferToBase64(file.buffer, file.mimetype);
        return { success: true, data: base64 };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Compress image before converting to base64
 * Useful for profile pictures to keep database size smaller
 * NOTE: Requires 'sharp' package: npm install sharp
 * @param {Object} file - Express file object
 * @param {Object} options - { width, height, quality }
 * @returns {Promise<Object>} { success: boolean, data: base64String or error: errorMessage }
 */
async function compressAndConvertToBase64(file, options = {}) {
    try {
        const sharp = require('sharp');
        
        const {
            width = 200,
            height = 200,
            quality = 80,
        } = options;

        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        // Check MIME type
        if (!ALLOWED_MIME_TYPES[file.mimetype]) {
            return { success: false, error: 'Only JPG, PNG, WebP, and GIF images allowed' };
        }

        // Compress with sharp
        const compressed = await sharp(file.buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center',
            })
            .jpeg({ quality })
            .toBuffer();

        const base64 = bufferToBase64(compressed, 'image/jpeg');
        return { success: true, data: base64 };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Extract base64 from HTML data URL or file input
 * @param {String} dataUrl - Data URL string (e.g., from Canvas or file input)
 * @returns {Object} { success: boolean, data: base64String }
 */
function extractBase64(dataUrl) {
    try {
        if (!dataUrl || !dataUrl.includes('base64,')) {
            return { success: false, error: 'Invalid base64 data URL' };
        }

        const base64 = dataUrl;
        return { success: true, data: base64 };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    fileToBase64,
    bufferToBase64,
    compressAndConvertToBase64,
    extractBase64,
    MAX_FILE_SIZES,
    ALLOWED_MIME_TYPES,
};
