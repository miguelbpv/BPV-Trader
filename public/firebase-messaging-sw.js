// Firebase Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Filled at build time / manually: see src/firebaseConfig.ts
self.addEventListener('message', (e)=>{
  if(e.data && e.data.type==='INIT_FIREBASE'){
    const cfg = e.data.config;
    firebase.initializeApp(cfg);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || 'BPV Trader';
      const options = {
        body: payload.notification?.body || '',
        icon: '/icons/icon-192.png',
        tag: payload.data?.tag || 'bpv-msg'
      };
      self.registration.showNotification(title, options);
    });
  }
});
