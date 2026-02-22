const fs = require('fs').promises;
const path = require('path');
const HashUtil = require('../utils/hashUtil');
const SimilarityUtil = require('../utils/similarityUtil');

/**
 * Test Registry Manager
 * Manages persistent storage of test metadata with hash and embedding lookups
 */
class TestRegistryManager {
  constructor(registryPath = null) {
    this.registryPath = registryPath || path.join(__dirname, '../data/test-registry.json');
    this.registry = [];
    this.loaded = false;
  }

  /**
   * Initialize registry by loading from disk
   * Creates file if it doesn't exist
   */
  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.registryPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Try to load existing registry
      try {
        const data = await fs.readFile(this.registryPath, 'utf8');
        this.registry = JSON.parse(data);
        console.log(`Registry loaded: ${this.registry.length} entries`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, create empty registry
          this.registry = [];
          await this.save();
          console.log('Created new registry file');
        } else {
          throw error;
        }
      }

      this.loaded = true;
    } catch (error) {
      console.error('Error initializing registry:', error);
      throw new Error(`Registry initialization failed: ${error.message}`);
    }
  }

  /**
   * Save registry to disk atomically
   */
  async save() {
    try {
      const tempPath = `${this.registryPath}.tmp`;
      const data = JSON.stringify(this.registry, null, 2);

      // Write to temp file first
      await fs.writeFile(tempPath, data, 'utf8');

      // Atomic rename
      await fs.rename(tempPath, this.registryPath);

      console.log(`Registry saved: ${this.registry.length} entries`);
    } catch (error) {
      console.error('Error saving registry:', error);
      throw new Error(`Registry save failed: ${error.message}`);
    }
  }

  /**
   * Find entry by exact hash match
   * @param {string} hash - SHA-256 hash
   * @returns {object | null} - Registry entry or null
   */
  findByHash(hash) {
    if (!this.loaded) {
      throw new Error('Registry not initialized');
    }

    return this.registry.find(entry => entry.hash === hash) || null;
  }

  /**
   * Find most similar entry by embedding
   * @param {number[]} embedding - Query embedding vector
   * @param {number} threshold - Minimum similarity (default 0.9)
   * @returns {{entry: object, similarity: number} | null}
   */
  findMostSimilar(embedding, threshold = 0.9) {
    if (!this.loaded) {
      throw new Error('Registry not initialized');
    }

    if (this.registry.length === 0) {
      return null;
    }

    try {
      const result = SimilarityUtil.findMostSimilar(embedding, this.registry);

      if (result && result.similarity >= threshold) {
        console.log(`Found similar entry: ${result.entry.className} (similarity: ${result.similarity.toFixed(4)})`);
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error finding similar entry:', error);
      return null;
    }
  }

  /**
   * Add new entry to registry
   * @param {object} entry - Test entry
   * @param {string} entry.hash - SHA-256 hash
   * @param {number[]} entry.embedding - Embedding vector
   * @param {string} entry.className - Java test class name
   * @param {string} entry.pageObjectPath - Absolute path to page object file
   * @param {string} entry.testFilePath - Absolute path to test file
   * @returns {Promise<object>} - Added entry
   */
  async addEntry(entry) {
    if (!this.loaded) {
      throw new Error('Registry not initialized');
    }

    // Validate required fields
    const required = ['hash', 'embedding', 'className', 'testFilePath'];
    for (const field of required) {
      if (!entry[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // pageObjectPath is optional (can be null for tests without page objects)

    // Check for duplicate hash
    if (this.findByHash(entry.hash)) {
      throw new Error(`Entry with hash ${entry.hash} already exists`);
    }

    // Add timestamp
    const newEntry = {
      ...entry,
      createdAt: new Date().toISOString()
    };

    try {
      this.registry.push(newEntry);
      await this.save();

      console.log(`Added new entry: ${newEntry.className}`);
      return newEntry;
    } catch (error) {
      // Rollback on save failure
      this.registry.pop();
      throw error;
    }
  }

  /**
   * Update existing entry
   * @param {string} hash - Entry hash
   * @param {object} updates - Fields to update
   * @returns {Promise<object | null>} - Updated entry or null
   */
  async updateEntry(hash, updates) {
    if (!this.loaded) {
      throw new Error('Registry not initialized');
    }

    const index = this.registry.findIndex(entry => entry.hash === hash);

    if (index === -1) {
      return null;
    }

    try {
      const oldEntry = { ...this.registry[index] };

      this.registry[index] = {
        ...this.registry[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.save();

      console.log(`Updated entry: ${this.registry[index].className}`);
      return this.registry[index];
    } catch (error) {
      // Rollback on save failure
      this.registry[index] = oldEntry;
      throw error;
    }
  }

  /**
   * Get all entries
   * @returns {Array<object>} - All registry entries
   */
  getAllEntries() {
    if (!this.loaded) {
      throw new Error('Registry not initialized');
    }

    return [...this.registry];
  }

  /**
   * Get registry statistics
   * @returns {object} - Statistics
   */
  getStats() {
    if (!this.loaded) {
      throw new Error('Registry not initialized');
    }

    return {
      totalEntries: this.registry.length,
      registryPath: this.registryPath,
      loaded: this.loaded
    };
  }
}

module.exports = TestRegistryManager;
