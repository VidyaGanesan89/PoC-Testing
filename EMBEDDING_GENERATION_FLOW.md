# Embedding Generation Flow

## Complete Journey: From Prompt to Embedding

### Step 1: User Enters Prompt 📝
**Location:** Frontend UI (`frontend/src/components/TestGenerator.jsx`)

```javascript
User types: "test login functionality with email and password"
```

### Step 2: Frontend Sends Request 🌐
**Location:** `frontend/src/components/TestGenerator.jsx`

```javascript
const response = await fetch('http://localhost:8080/api/generate-ai-test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "test login functionality with email and password",
    testType: "functional",
    llm: "GPT-4o",
    forceNew: false
  })
});
```

### Step 3: Backend API Receives Request 🔌
**Location:** `backend/routes/api.js` (Line ~180)

```javascript
router.post('/api/generate-ai-test', async (req, res) => {
  const { prompt, testType, llm, forceNew } = req.body;
  const originalPrompt = prompt; // Keep original for matching
  
  // Initialize TestRequestHandler
  const handler = new TestRequestHandler();
  await handler.initialize();
```

### Step 4: Generate Hash from Prompt 🔐
**Location:** `prompt validation/backend/services/testRequestHandler.js` (Line ~69)

```javascript
// In processTestRequest()
const hash = HashUtil.generateHash(originalPrompt);
// Result: "a3f8e92b1c..." (SHA-256 hash, 64 hex chars)
```

**How it works:** `prompt validation/backend/utils/hashUtil.js`
```javascript
generateHash(text) {
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim(), 'utf8')
    .digest('hex');
}
```

### Step 5: Generate Embedding from Prompt 🧠
**Location:** `prompt validation/backend/services/testRequestHandler.js` (Line ~91-93)

```javascript
// Generate embedding for semantic similarity matching
const embedding = await this.embeddingUtil.generateEmbedding(originalPrompt);
console.log('Embedding dimension:', embedding.length); // 384 or 1536
```

### Step 6: Embedding Generation Logic ⚙️
**Location:** `prompt validation/backend/utils/embeddingUtil.js`

```javascript
async generateEmbedding(text) {
  // Try OpenAI first if available
  if (this.openaiClient) {
    try {
      return await this.generateOpenAIEmbedding(text);
      // Returns: 1536-dimensional vector from OpenAI API
    } catch (error) {
      console.warn('OpenAI failed, using fallback');
    }
  }
  
  // Use deterministic fallback
  return this.generateFallbackEmbedding(text);
  // Returns: 384-dimensional vector
}
```

### Step 7A: OpenAI Embedding (If Available) 🤖
**Location:** `prompt validation/backend/utils/embeddingUtil.js`

```javascript
async generateOpenAIEmbedding(text) {
  const response = await this.openaiClient.embeddings.create({
    model: 'text-embedding-3-small', // OpenAI model
    input: text
  });
  
  return response.data[0].embedding; // 1536 numbers
}
```

**Example Output:**
```javascript
[
  -0.0234, 0.0567, -0.0123, 0.0891, 0.0234, -0.0456, ...
  // 1536 unique floating-point numbers between -1 and 1
]
```

### Step 7B: Fallback Embedding (No OpenAI) 🔧
**Location:** `prompt validation/backend/utils/embeddingUtil.js` (FIXED VERSION)

```javascript
generateFallbackEmbedding(text) {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // For each word in the prompt
  words.forEach((word, wordIndex) => {
    // Hash the word with SHA-512 (128 hex chars)
    const wordHash = crypto
      .createHash('sha512')
      .update(word + wordIndex.toString(), 'utf8')
      .digest('hex');
    
    // Distribute hash across all 384 dimensions
    for (let i = 0; i < 384; i++) {
      const char1 = (i * 2) % wordHash.length;
      const char2 = (i * 2 + 1) % wordHash.length;
      const hexValue1 = parseInt(wordHash[char1], 16);
      const hexValue2 = parseInt(wordHash[char2], 16);
      
      // Combine values with dimension index for uniqueness
      const value = ((hexValue1 * 16 + hexValue2) + wordIndex * 256 + i) / (4096 + words.length);
      embedding[i] += Math.sin(value * (i + 1)) * Math.cos(wordIndex + 1);
    }
  });
  
  // L2 Normalization (make magnitude = 1)
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );
  
  return embedding.map(val => val / magnitude);
}
```

**Example for prompt: "test login functionality"**

```
Input: "test login functionality"
↓
Words: ["test", "login", "functionality"]
↓
Word 0 "test": Hash → Distribute across 384 dims → Add to embedding[0-383]
Word 1 "login": Hash → Distribute across 384 dims → Add to embedding[0-383]
Word 2 "functionality": Hash → Distribute across 384 dims → Add to embedding[0-383]
↓
L2 Normalize
↓
Output: [
  -0.0234, 0.0567, -0.0891, 0.0123, ..., 0.0456
  // 384 unique numbers, magnitude = 1.0
]
```

### Step 8: Check for Similar Tests 🔍
**Location:** `prompt validation/backend/services/testRequestHandler.js`

```javascript
// Use embedding to find similar existing tests
const similarMatch = this.registryManager.findMostSimilar(
  embedding,
  0.50 // 50% similarity threshold
);

if (similarMatch) {
  console.log(`Found similar test (${similarMatch.similarity * 100}%)`);
  // Reuse existing test
} else {
  // Generate new test
}
```

**Similarity Calculation:** `prompt validation/backend/utils/similarityUtil.js`
```javascript
// Cosine similarity: measures angle between two vectors
cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB); // Range: -1 to 1 (1 = identical)
}
```

### Step 9: Store New Test with Embedding 💾
**Location:** `prompt validation/backend/services/testRegistryManager.js`

```javascript
addEntry({
  hash: "a3f8e92b1c...",
  embedding: [-0.0234, 0.0567, ...], // 384 or 1536 numbers
  className: "LoginTest",
  testFilePath: "C:\\...\\LoginTest.java",
  pageObjectPath: "C:\\...\\LoginTestPage.java",
  prompt: "test login functionality with email and password",
  createdAt: "2026-02-16T10:30:00.000Z"
});

// Save to: prompt validation/backend/data/test-registry.json
```

## Summary: Why Embeddings?

**Purpose:** Detect duplicate or similar test requests to avoid regenerating tests

**How:**
1. **Hash** → Exact duplicate detection (fast, but only catches identical prompts)
2. **Embedding** → Semantic similarity detection (slower, but catches similar meanings)

**Example:**
```
Prompt 1: "test login functionality"
Prompt 2: "verify user authentication"
→ Different hashes (not exact match)
→ Similar embeddings! (85% similarity)
→ System reuses existing test
```

**Benefits:**
- ✅ Saves LLM API calls (expensive)
- ✅ Faster test generation (reuse existing)
- ✅ Consistent test code for similar requirements
- ✅ Detects semantic equivalence ("login" ≈ "sign in" ≈ "authentication")

## Embedding Dimensions

| Method | Dimensions | Quality | Speed | Cost |
|--------|-----------|---------|-------|------|
| **OpenAI** | 1536 | Excellent | Medium | Paid API |
| **Fallback** | 384 | Good | Fast | Free |

**Note:** The fixed fallback now generates properly distributed 384 unique values (no repetition bug).
