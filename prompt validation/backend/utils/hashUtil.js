const crypto = require('crypto');

/**
 * Hash Utility
 * Provides deterministic SHA-256 hashing for normalized prompts
 */
class HashUtil {
  /**
   * Normalize a prompt for consistent hashing
   * @param {string} prompt - Raw user prompt
   * @returns {string} - Normalized prompt
   */
  static normalizePrompt(prompt) {
    if (typeof prompt !== 'string') {
      throw new Error('Prompt must be a string');
    }

    return prompt
      .toLowerCase()                          // Convert to lowercase
      .trim()                                 // Remove leading/trailing spaces
      .replace(/[^\w\s]/g, '')               // Remove punctuation
      .replace(/\s+/g, ' ')                  // Normalize multiple spaces to single
      .trim();                               // Final trim
  }

  /**
   * Generate SHA-256 hash for a normalized prompt
   * @param {string} prompt - Raw user prompt
   * @returns {string} - SHA-256 hash (hex)
   */
  static generateHash(prompt) {
    try {
      const normalized = this.normalizePrompt(prompt);
      
      return crypto
        .createHash('sha256')
        .update(normalized, 'utf8')
        .digest('hex');
    } catch (error) {
      console.error('Error generating hash:', error);
      throw new Error(`Hash generation failed: ${error.message}`);
    }
  }

  /**
   * Verify if a prompt matches a given hash
   * @param {string} prompt - Prompt to verify
   * @param {string} hash - Expected hash
   * @returns {boolean} - True if match
   */
  static verifyHash(prompt, hash) {
    try {
      const computedHash = this.generateHash(prompt);
      return computedHash === hash;
    } catch (error) {
      console.error('Error verifying hash:', error);
      return false;
    }
  }
}

module.exports = HashUtil;
