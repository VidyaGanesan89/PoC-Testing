const OpenAI = require('openai');

// Fix SSL certificate issue for corporate networks (development only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Azure OpenAI Configuration
const azureEndpoint = 'https://diarymilk-5.openai.azure.com';
const azureApiKey = 'YOUR_AZURE_OPENAI_KEY_HERE';
const deploymentName = 'gpt-4o';  // Actual deployment name (not the resource name 'GlobalStandard')
const apiVersion = '2023-05-15';  // Try stable API version

// Initialize Azure OpenAI client
// For Azure OpenAI, use the generic OpenAI client with Azure-specific config
const openai = new OpenAI({
  apiKey: azureApiKey,
  baseURL: `${azureEndpoint}/openai/deployments/${deploymentName}`,
  defaultQuery: { 'api-version': apiVersion },
  defaultHeaders: { 'api-key': azureApiKey }
});

// Configuration
const config = {
  embeddingModel: 'text-embedding-3-small',
  chatModel: deploymentName,  // Use Azure deployment name
  maxTokens: 1000,
  temperature: 0.7
};

module.exports = {
  openai,
  config
};
