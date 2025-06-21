const jwt = require('jsonwebtoken');

// Utilisation de votre clé secrète Clerk
const CLERK_SECRET_KEY = 'sk_test_zpXRshmm4SSnqaZ70RHkg5s0aImEWf5s8EDXECrBXE';

const payload = {
  sub: 'user_test123', // ID utilisateur fictif pour les tests
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Validité: 24 heures
};

const token = jwt.sign(payload, CLERK_SECRET_KEY);
console.log('Token JWT pour les tests:');
console.log(token);