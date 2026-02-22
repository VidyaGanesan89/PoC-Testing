const crypto = require('crypto');

/**
 * Embedding Utility
 * Generates vector embeddings for prompts with OpenAI fallback to deterministic method
 */
class EmbeddingUtil {
  /**
   * Initialize with optional OpenAI client
   * @param {object} openaiClient - Optional OpenAI client instance
   */
  constructor(openaiClient = null) {
    this.openaiClient = openaiClient;
    this.embeddingModel = 'text-embedding-3-small';
    this.fallbackDimension = 384; // Standard embedding dimension
  }

  /**
   * Generate embedding using OpenAI API
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateOpenAIEmbedding(text) {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.openaiClient.embeddings.create({
        model: this.embeddingModel,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error.message);
      throw error;
    }
  }

  /**
   * Generate deterministic fallback embedding using word hashing
   * Creates a consistent vector representation without AI
   * @param {string} text - Text to embed
   * @returns {number[]} - Deterministic embedding vector
   */
  generateFallbackEmbedding(text) {
    try {
      const normalized = text.toLowerCase().trim();
      const words = normalized.split(/\s+/);
      const embedding = new Array(this.fallbackDimension).fill(0);

      // Use word-based hashing to populate embedding
      words.forEach((word, wordIndex) => {
        // Create hash for each word using SHA-512 (128 hex chars for better distribution)
        const wordHash = crypto
          .createHash('sha512')
          .update(word + wordIndex.toString(), 'utf8') // Include word position for uniqueness
          .digest('hex');

        // Distribute hash values across embedding dimensions
        for (let i = 0; i < this.fallbackDimension; i++) {
          // Use multiple hash characters per dimension to avoid repetition
          const charIndex1 = (i * 2) % wordHash.length;
          const charIndex2 = (i * 2 + 1) % wordHash.length;
          const hexValue1 = parseInt(wordHash[charIndex1], 16);
          const hexValue2 = parseInt(wordHash[charIndex2], 16);
          
          // Combine hash values with dimension index for unique values per position
          const value = ((hexValue1 * 16 + hexValue2) + wordIndex * 256 + i) / (4096 + words.length);
          embedding[i] += Math.sin(value * (i + 1)) * Math.cos(wordIndex + 1);
        }
      });

      // Normalize the embedding vector (L2 normalization)
      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );

      if (magnitude > 0) {
        return embedding.map(val => val / magnitude);
      }

      return embedding;
    } catch (error) {
      console.error('Fallback embedding error:', error);
      throw new Error(`Fallback embedding failed: ${error.message}`);
    }
  }

  /**
   * Generate embedding with automatic fallback
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Text must be a non-empty string');
    }

    // Try OpenAI first if available
    if (this.openaiClient) {
      try {
        return await this.generateOpenAIEmbedding(text);
      } catch (error) {
        console.warn('OpenAI embedding failed, using fallback:', error.message);
      }
    }

    // Use deterministic fallback
    return this.generateFallbackEmbedding(text);
  }
}

module.exports = EmbeddingUtil;
