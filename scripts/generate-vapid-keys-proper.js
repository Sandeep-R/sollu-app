/**
 * Generate proper VAPID keys using web-push library
 * Run: node scripts/generate-vapid-keys-proper.js
 */

const webpush = require('web-push');

console.log('\n🔑 Generating VAPID Keys using web-push library...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log('─'.repeat(80));
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@sollu.app`);
console.log('─'.repeat(80));
console.log('\n⚠️  Important:');
console.log('1. Replace the existing keys in .env.local with these new ones');
console.log('2. Keep VAPID_PRIVATE_KEY secret - never commit it to version control');
console.log('3. Add these to your Vercel/production environment variables');
console.log('4. Restart your dev server after updating .env.local\n');
