/**
 * Test Azure OpenAI with direct HTTP request (no SDK)
 */

const https = require('https');

// SSL bypass for corporate network
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const azureEndpoint = 'diarymilk-5.openai.azure.com';
const deploymentName = 'GlobalStandard';
const apiKey = 'YOUR_AZURE_OPENAI_KEY_HERE';
const apiVersion = '2023-05-15';

// Try different URL formats
const urlFormats = [
  `/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
  `/openai/deployments/globalstandard/chat/completions?api-version=${apiVersion}`,  // lowercase
  `/openai/deployments/gpt-4o/chat/completions?api-version=${apiVersion}`,  // model name
];

async function testFormat(path) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${path}`);
    
    const postData = JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello!"' }
      ],
      max_tokens: 10
    });

    const options = {
      hostname: azureEndpoint,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS!`);
          const response = JSON.parse(data);
          console.log(`   Response: ${response.choices[0].message.content}`);
        } else {
          console.log(`   ❌ Failed: ${data.substring(0, 100)}...`);
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ Error: ${e.message}`);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('\n🔵 DIRECT HTTP TEST - AZURE OPENAI\n');
  console.log('Endpoint:', azureEndpoint);
  console.log('API Key:', '***' + apiKey.slice(-10));
  console.log('\nTrying different deployment name formats...\n');
  
  for (const format of urlFormats) {
    await testFormat(format);
    await new Promise(resolve => setTimeout(resolve, 1000));  // Wait 1 sec between attempts
  }
  
  console.log('\n✅ Test complete!\n');
}

main().catch(console.error);
