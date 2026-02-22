/**
 * Similarity Utility
 * Implements cosine similarity calculation for vector embeddings
 */
class SimilarityUtil {
  /**
   * Calculate cosine similarity between two vectors
   * Similarity = (A · B) / (||A|| × ||B||)
   * Result range: [-1, 1] where 1 = identical, 0 = orthogonal, -1 = opposite
   * 
   * @param {number[]} vectorA - First embedding vector
   * @param {number[]} vectorB - Second embedding vector
   * @returns {number} - Cosine similarity score
   */
  static cosineSimilarity(vectorA, vectorB) {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
      throw new Error('Both inputs must be arrays');
    }

    if (vectorA.length !== vectorB.length) {
      throw new Error(`Vector dimensions must match: ${vectorA.length} vs ${vectorB.length}`);
    }

    if (vectorA.length === 0) {
      throw new Error('Vectors cannot be empty');
    }

    try {
      let dotProduct = 0;
      let magnitudeA = 0;
      let magnitudeB = 0;

      // Calculate dot product and magnitudes in single pass
      for (let i = 0; i < vectorA.length; i++) {
        const a = vectorA[i];
        const b = vectorB[i];

        dotProduct += a * b;
        magnitudeA += a * a;
        magnitudeB += b * b;
      }

      // Calculate final magnitudes
      magnitudeA = Math.sqrt(magnitudeA);
      magnitudeB = Math.sqrt(magnitudeB);

      // Avoid division by zero
      if (magnitudeA === 0 || magnitudeB === 0) {
        console.warn('Zero magnitude vector detected');
        return 0;
      }

      // Calculate cosine similarity
      const similarity = dotProduct / (magnitudeA * magnitudeB);

      // Clamp to valid range [-1, 1] to handle floating point errors
      return Math.max(-1, Math.min(1, similarity));
    } catch (error) {
      console.error('Error calculating cosine similarity:', error);
      throw new Error(`Similarity calculation failed: ${error.message}`);
    }
  }

  /**
   * Find the most similar entry from a list of entries
   * @param {number[]} queryVector - Query embedding
   * @param {Array<{embedding: number[], ...}>} entries - List of registry entries
   * @returns {{entry: object, similarity: number} | null} - Most similar entry and score
   */
  static findMostSimilar(queryVector, entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    let maxSimilarity = -1;
    let mostSimilarEntry = null;

    for (const entry of entries) {
      if (!entry.embedding || !Array.isArray(entry.embedding)) {
        console.warn('Skipping entry without valid embedding');
        continue;
      }

      try {
        const similarity = this.cosineSimilarity(queryVector, entry.embedding);

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mostSimilarEntry = entry;
        }
      } catch (error) {
        console.warn(`Error comparing with entry: ${error.message}`);
        continue;
      }
    }

    if (mostSimilarEntry === null) {
      return null;
    }

    return {
      entry: mostSimilarEntry,
      similarity: maxSimilarity
    };
  }

  /**
   * Filter entries by minimum similarity threshold
   * @param {number[]} queryVector - Query embedding
   * @param {Array<{embedding: number[], ...}>} entries - List of registry entries
   * @param {number} threshold - Minimum similarity (0-1)
   * @returns {Array<{entry: object, similarity: number}>} - Filtered and sorted entries
   */
  static filterBySimilarity(queryVector, entries, threshold = 0.9) {
    if (!Array.isArray(entries)) {
      return [];
    }

    const results = [];

    for (const entry of entries) {
      if (!entry.embedding || !Array.isArray(entry.embedding)) {
        continue;
      }

      try {
        const similarity = this.cosineSimilarity(queryVector, entry.embedding);

        if (similarity >= threshold) {
          results.push({ entry, similarity });
        }
      } catch (error) {
        console.warn(`Error filtering entry: ${error.message}`);
        continue;
      }
    }

    // Sort by similarity descending
    return results.sort((a, b) => b.similarity - a.similarity);
  }
}

module.exports = SimilarityUtil;
