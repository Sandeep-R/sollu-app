/**
 * Push Notification Diagnostic Script
 * 
 * Copy and paste this entire script into your browser console (F12 → Console tab)
 * on your Vercel deployed app, then copy the output and share it with me.
 */

(async function diagnosticScript() {
  console.log('🔍 Starting Push Notification Diagnostics...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    browser: {
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      pushManagerSupported: 'PushManager' in window,
      notificationSupported: 'Notification' in window,
    },
    serviceWorker: {},
    errors: [],
  };

  // Check service worker support
  if (!results.browser.serviceWorkerSupported) {
    results.errors.push('Service workers are NOT supported in this browser');
    console.error('❌ Service workers NOT supported');
  } else {
    console.log('✅ Service workers are supported');
  }

  // Check service worker file accessibility
  try {
    console.log('🔵 Checking /sw.js accessibility...');
    const swResponse = await fetch('/sw.js', { method: 'HEAD', cache: 'no-store' });
    results.serviceWorker.fileAccessible = swResponse.ok;
    results.serviceWorker.statusCode = swResponse.status;
    results.serviceWorker.statusText = swResponse.statusText;
    results.serviceWorker.contentType = swResponse.headers.get('content-type');
    
    if (swResponse.ok) {
      console.log(`✅ /sw.js is accessible (${swResponse.status})`);
      console.log(`   Content-Type: ${results.serviceWorker.contentType}`);
    } else {
      results.errors.push(`/sw.js returned ${swResponse.status} ${swResponse.statusText}`);
      console.error(`❌ /sw.js returned ${swResponse.status} ${swResponse.statusText}`);
    }
  } catch (error) {
    results.serviceWorker.fileAccessible = false;
    results.errors.push(`Error fetching /sw.js: ${error.message}`);
    console.error('❌ Error fetching /sw.js:', error);
  }

  // Check existing service worker registration
  if (results.browser.serviceWorkerSupported) {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        results.serviceWorker.registered = true;
        results.serviceWorker.scope = registration.scope;
        results.serviceWorker.active = registration.active?.scriptURL || null;
        results.serviceWorker.installing = registration.installing?.scriptURL || null;
        results.serviceWorker.waiting = registration.waiting?.scriptURL || null;
        console.log('✅ Service worker is registered');
        console.log(`   Scope: ${registration.scope}`);
        console.log(`   Active: ${results.serviceWorker.active || 'None'}`);
      } else {
        results.serviceWorker.registered = false;
        console.log('⚠️ No service worker registered');
      }
    } catch (error) {
      results.errors.push(`Error checking registration: ${error.message}`);
      console.error('❌ Error checking registration:', error);
    }

    // Try to register service worker
    try {
      console.log('🔵 Attempting to register service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      results.serviceWorker.registrationAttempted = true;
      results.serviceWorker.registrationSuccess = true;
      results.serviceWorker.registrationScope = registration.scope;
      console.log('✅ Service worker registration initiated');
      
      // Wait a bit for it to activate
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedReg = await navigator.serviceWorker.getRegistration('/');
      if (updatedReg?.active) {
        results.serviceWorker.activated = true;
        console.log('✅ Service worker is active');
      } else {
        results.serviceWorker.activated = false;
        console.log('⚠️ Service worker registered but not yet active');
      }
    } catch (error) {
      results.serviceWorker.registrationAttempted = true;
      results.serviceWorker.registrationSuccess = false;
      results.serviceWorker.registrationError = error.message;
      results.errors.push(`Registration error: ${error.message}`);
      console.error('❌ Error registering service worker:', error);
    }
  }

  // Check notification permission
  if (results.browser.notificationSupported) {
    results.notificationPermission = Notification.permission;
    console.log(`📱 Notification permission: ${Notification.permission}`);
  }

  // Check VAPID key (from environment, visible in client)
  try {
    const debugResponse = await fetch('/api/notifications/debug');
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      results.debugEndpoint = debugData;
      console.log('✅ Debug endpoint accessible');
      console.log('   VAPID Public Key:', debugData.vapid?.publicKey || 'NOT SET');
      console.log('   VAPID Private Key:', debugData.vapid?.privateKey || 'NOT SET');
      console.log('   VAPID Subject:', debugData.vapid?.subject || 'NOT SET');
    } else {
      results.errors.push(`Debug endpoint returned ${debugResponse.status}`);
      console.error(`❌ Debug endpoint returned ${debugResponse.status}`);
    }
  } catch (error) {
    results.errors.push(`Error fetching debug endpoint: ${error.message}`);
    console.error('❌ Error fetching debug endpoint:', error);
  }

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('═══════════════════════════════════════');
  console.log(JSON.stringify(results, null, 2));
  console.log('═══════════════════════════════════════\n');
  
  console.log('📋 Copy the JSON output above and share it with me!');
  
  return results;
})();
