import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://archihub-backend-production.up.railway.app';

// Test CORS pour localhost:8080
async function testCors8080() {
  console.log('🧪 Test CORS pour localhost:8080...\n');

  // 1. Test OPTIONS preflight pour localhost:8080
  console.log('1️⃣ Test OPTIONS preflight (localhost:8080)...');
  try {
    const optionsResponse = await axios.options(`${API_BASE_URL}/workspaces`, {
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ OPTIONS preflight réussi');
    console.log('Status:', optionsResponse.status);
    console.log('Headers CORS:');
    console.log('- Access-Control-Allow-Origin:', optionsResponse.headers['access-control-allow-origin']);
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers['access-control-allow-methods']);
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers['access-control-allow-headers']);
    console.log('- Access-Control-Allow-Credentials:', optionsResponse.headers['access-control-allow-credentials']);
  } catch (error) {
    console.log('❌ OPTIONS preflight échoué:', error.response?.status, error.response?.data);
  }

  // 2. Test GET workspaces
  console.log('\n2️⃣ Test GET /workspaces...');
  try {
    const getResponse = await axios.get(`${API_BASE_URL}/workspaces`, {
      headers: {
        'Origin': 'http://localhost:8080'
      }
    });
    console.log('✅ GET workspaces réussi');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ GET workspaces - 401 (authentification requise, normal)');
    } else {
      console.log('❌ GET workspaces échoué:', error.response?.status, error.response?.data);
    }
  }

  // 3. Test OPTIONS preflight pour PATCH
  console.log('\n3️⃣ Test OPTIONS preflight PATCH...');
  try {
    const patchOptionsResponse = await axios.options(`${API_BASE_URL}/projects/test`, {
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ OPTIONS PATCH preflight réussi');
    console.log('Status:', patchOptionsResponse.status);
    console.log('Methods autorisés:', patchOptionsResponse.headers['access-control-allow-methods']);
  } catch (error) {
    console.log('❌ OPTIONS PATCH preflight échoué:', error.response?.status, error.response?.data);
  }

  console.log('\n🎯 Résumé:');
  console.log('- OPTIONS preflight: Testé');
  console.log('- GET workspaces: Testé');
  console.log('- OPTIONS PATCH: Testé');
  console.log('\n✅ Tests terminés !');
}

// Exécuter les tests
testCors8080().catch(console.error); 