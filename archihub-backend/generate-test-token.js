const axios = require('axios');
require('dotenv').config();

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
const TEST_USER_ID = 'user_2ypZXnHwTR3NdG5oM3FmQbKW9eM';

async function generateSessionToken() {
  try {
    console.log('Tentative de création d\'un token JWT...');
    
    // Ajout du paramètre template_name requis
    const response = await axios.post(
      `https://api.clerk.com/v1/tokens`,
      {
        user_id: TEST_USER_ID,
        expires_in: 3600,
        template_name: "verification" // Paramètre obligatoire manquant
      },
      {
        headers: {
          Authorization: `Bearer ${CLERK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Token JWT pour les tests:');
    console.log(response.data.jwt);
  } catch (error) {
    console.error('Erreur lors de la génération du token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erreur:', error.message);
    }
  }
}

generateSessionToken();