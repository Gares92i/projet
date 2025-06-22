const jwt = require('jsonwebtoken');
require('dotenv').config();

// Clé privée pour signer le token (uniquement pour les tests)
const TEST_PRIVATE_KEY = 'test-secret-key-not-for-production';

// Créer un payload similaire à celui de Clerk
const payload = {
  sub: "user_2ypZXnHwTR3NdG5oM3FmQbKW9eM", // L'ID utilisateur réel
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  jti: "test_" + Date.now(),
  iss: "https://actual-gator-23.clerk.accounts.dev",
  aud: "https://clerk.actual-gator-23.accounts.dev"
};

// Signer le token
const token = jwt.sign(payload, TEST_PRIVATE_KEY);
console.log("Token de test pour le développement:");
console.log(token);