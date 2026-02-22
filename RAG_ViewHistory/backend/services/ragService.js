const { openai, config } = require('../config/openai');
const testHistoryService = require('./testHistoryService');

/**
 * In-Memory Vector Store for Test Run Embeddings
 */
class VectorStore {
  constructor() {
    this.vectors = []; // { runId, embedding, text, metadata }
  }

  /**
   * Add a vector to the store
   */
  add(runId, embedding, text, metadata) {
    this.vectors.push({ runId, embedding, text, metadata });
  }

  /**
   * Find similar vectors using cosine similarity
   */
  findSimilar(queryEmbedding, topK = 5) {
    const similarities = this.vectors.map(vector => ({
      ...vector,
      similarity: this.cosineSimilarity(queryEmbedding, vector.embedding)
    }));

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topK);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  /**
   * Clear all vectors
   */
  clear() {
    this.vectors = [];
  }

  /**
   * Get count of vectors
   */
  size() {
    return this.vectors.length;
  }
}

/**
 * RAG Service for Test History
 */
class RAGService {
  constructor() {
    this.vectorStore = new VectorStore();
    this.initialized = false;
  }

  /**
   * Initialize the RAG service by loading and embedding all test runs
   */
  async initialize() {
    try {
      console.log('Initializing RAG service...');
      
      // Clear existing vectors
      this.vectorStore.clear();

      // Get all test runs
      const testRuns = await testHistoryService.getAllTestRuns(500);
      console.log(`Loading ${testRuns.length} test runs...`);

      // Embed each test run
      for (const testRun of testRuns) {
        await this.embedTestRun(testRun);
      }

      this.initialized = true;
      console.log(`RAG service initialized with ${this.vectorStore.size()} vectors`);
    } catch (error) {
      console.error('Error initializing RAG service:', error);
      throw error;
    }
  }

  /**
   * Embed a single test run and add to vector store
   */
  async embedTestRun(testRun) {
    try {
      const text = testRun.toEmbeddingText();
      const embedding = await this.getEmbedding(text);

      this.vectorStore.add(
        testRun.runId,
        embedding,
        text,
        {
          runId: testRun.runId,
          testType: testRun.testType,
          status: testRun.status,
          timestamp: testRun.timestamp,
          prompt: testRun.prompt
        }
      );
    } catch (error) {
      console.error(`Error embedding test run ${testRun.runId}:`, error);
    }
  }

  /**
   * Get embedding for text using OpenAI
   */
  async getEmbedding(text) {
    try {
      const response = await openai.embeddings.create({
        model: config.embeddingModel,
        input: text
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw error;
    }
  }

  /**
   * Query the RAG system with natural language
   */
  async query(question) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Get embedding for the question
      const questionEmbedding = await this.getEmbedding(question);

      // Find similar test runs
      const similarRuns = this.vectorStore.findSimilar(questionEmbedding, 5);

      // Retrieve full test run details
      const relevantRuns = await Promise.all(
        similarRuns.map(async (item) => {
          const testRun = await testHistoryService.getTestRun(item.runId);
          return {
            ...testRun.toJSON(),
            similarity: item.similarity
          };
        })
      );

      // Generate answer using LLM
      const answer = await this.generateAnswer(question, relevantRuns);

      return {
        question,
        answer,
        relevantRuns: relevantRuns.map(run => ({
          runId: run.runId,
          testType: run.testType,
          status: run.status,
          timestamp: run.timestamp,
          similarity: run.similarity
        }))
      };
    } catch (error) {
      console.error('Error querying RAG:', error);
      throw error;
    }
  }

  /**
   * Generate answer using LLM with context
   */
  async generateAnswer(question, relevantRuns) {
    try {
      // Prepare context from relevant runs
      const context = relevantRuns.map((run, index) => {
        return `
Test Run ${index + 1}:
- Run ID: ${run.runId}
- Type: ${run.testType}
- Status: ${run.status}
- Timestamp: ${run.timestamp}
- Duration: ${run.duration}ms
- Prompt: ${run.prompt || 'N/A'}
- Test: ${run.testClass || 'N/A'} ${run.testMethod ? `#${run.testMethod}` : ''}
- Errors: ${run.errorLogs && run.errorLogs.length > 0 ? run.errorLogs.join('; ') : 'None'}
`;
      }).join('\n---\n');

      const systemPrompt = `You are an AI assistant analyzing Selenium test execution history. 
You have access to past test runs and can provide insights, identify patterns, and help debug failures.
Answer questions concisely and accurately based on the provided test history context.
If information is not in the context, say so.`;

      const userPrompt = `Question: ${question}

Test History Context:
${context}

Please provide a clear, concise answer to the question based on the test history provided above.`;

      const response = await openai.chat.completions.create({
        model: config.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating answer:', error);
      throw error;
    }
  }

  /**
   * Add a new test run to the vector store
   */
  async addTestRun(testRun) {
    await this.embedTestRun(testRun);
  }

  /**
   * Get statistics about the vector store
   */
  getStats() {
    return {
      vectorCount: this.vectorStore.size(),
      initialized: this.initialized
    };
  }
}

module.exports = new RAGService();
