/**
 * Script to generate VAPID keys for Web Push notifications
 *
 * Run: node scripts/generate-vapid-keys.js
 *
 * This will generate a pair of VAPID keys and show you the environment
 * variables to add to your .env.local file.
 */

const crypto = require('crypto');

function urlBase64Encode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateVapidKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der',
    },
  });

  return {
    publicKey: urlBase64Encode(publicKey),
    privateKey: urlBase64Encode(privateKey),
  };
}

console.log('\n🔑 Generating VAPID Keys...\n');

const keys = generateVapidKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log('─'.repeat(80));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@sollu.app`);
console.log('─'.repeat(80));
console.log('\n⚠️  Important:');
console.log('1. Keep VAPID_PRIVATE_KEY secret - never commit it to version control');
console.log('2. Add these to your Vercel/production environment variables');
console.log('3. Add these to your Supabase Edge Function secrets\n');
