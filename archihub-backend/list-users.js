const axios = require('axios');
require('dotenv').config();

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;

async function listUsers() {
  try {
    console.log('Tentative de récupération des utilisateurs...');
    console.log(`Clé API: ${CLERK_API_KEY ? 'Présente (masquée)' : 'Manquante'}`);
    
    const response = await axios.get(
      `https://api.clerk.com/v1/users`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Structure de la réponse:', JSON.stringify(Object.keys(response.data), null, 2));
    
    // Affichage adapté à la structure réelle
    if (Array.isArray(response.data)) {
      console.log('Utilisateurs trouvés:');
      response.data.forEach(user => {
        console.log(`ID: ${user.id}, Email: ${user.email_addresses && user.email_addresses[0]?.email_address}`);
      });
    } else if (response.data.data && Array.isArray(response.data.data)) {
      console.log('Utilisateurs trouvés (dans data):');
      response.data.data.forEach(user => {
        console.log(`ID: ${user.id}, Email: ${user.email_addresses && user.email_addresses[0]?.email_address}`);
      });
    } else {
      console.log('Structure de réponse différente:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erreur:', error.message);
    }
  }
}

listUsers();