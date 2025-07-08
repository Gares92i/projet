import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://archihub-backend-production.up.railway.app';
const TEST_PROJECT_ID = '4949182d-0017-49e3-ac10-9818c5f66fa0';

// Test CORS PATCH
async function testCorsPatch() {
  console.log('🧪 Test CORS PATCH...');
  
  try {
    // Test OPTIONS preflight
    console.log('1. Test OPTIONS preflight...');
    const optionsResponse = await axios.options(`${API_BASE_URL}/projects/${TEST_PROJECT_ID}`, {
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ OPTIONS preflight réussi');
    console.log('Headers reçus:', optionsResponse.headers);
    
    // Test PATCH (sans authentification pour tester CORS)
    console.log('\n2. Test PATCH (sans auth)...');
    const patchResponse = await axios.patch(`${API_BASE_URL}/projects/${TEST_PROJECT_ID}`, {
      name: 'Test CORS PATCH'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      }
    });
    
    console.log('✅ PATCH réussi (sans auth)');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur HTTP:', error.response.status, error.response.data);
      console.log('Headers de réponse:', error.response.headers);
    } else if (error.request) {
      console.log('❌ Erreur réseau:', error.message);
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
}

// Test équipes
async function testTeams() {
  console.log('\n🧪 Test équipes...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/teams`);
    console.log('✅ Équipes récupérées:', response.data.length, 'membres');
  } catch (error) {
    if (error.response) {
      console.log('❌ Erreur équipes:', error.response.status, error.response.data);
    } else {
      console.log('❌ Erreur réseau équipes:', error.message);
    }
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  await testCorsPatch();
  await testTeams();
  
  console.log('\n✅ Tests terminés');
}

runTests().catch(console.error); 