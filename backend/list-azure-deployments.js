/**
 * List available Azure OpenAI deployments
 */

const https = require('https');

const azureEndpoint = 'diarymilk-5.openai.azure.com';
const azureApiKey = 'YOUR_AZURE_OPENAI_KEY_HERE';
const apiVersion = '2024-02-15-preview';

// Bypass SSL verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function listDeployments() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: azureEndpoint,
      path: `/openai/deployments?api-version=${apiVersion}`,
      method: 'GET',
      headers: {
        'api-key': azureApiKey
      }
    };

    console.log('\n🔍 Checking Azure OpenAI deployments...\n');
    console.log('Endpoint:', `https://${azureEndpoint}`);
    console.log('Path:', options.path);
    console.log('');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('');
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('✅ Available Deployments:\n');
            
            if (parsed.data && parsed.data.length > 0) {
              parsed.data.forEach((deployment, idx) => {
                console.log(`${idx + 1}. Deployment Name: ${deployment.id || deployment.model}`);
                console.log(`   Model: ${deployment.model || 'N/A'}`);
                console.log(`   Status: ${deployment.status || 'N/A'}`);
                console.log('');
              });
              
              console.log('📝 Use one of these deployment names in your config!\n');
            } else {
              console.log('⚠️ No deployments found. You need to create a deployment in Azure Portal.\n');
            }
            
            resolve(parsed);
          } catch (err) {
            console.log('Raw Response:', data);
            reject(err);
          }
        } else {
          console.log('❌ Error Response:', data);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

listDeployments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
