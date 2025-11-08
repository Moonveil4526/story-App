self.addEventListener('push', (event) => {
  console.log('Push event diterima:', event);

  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      console.warn('Push event data bukan JSON, gunakan sebagai teks.');
      payload = { title: 'Pesan Baru', body: event.data.text() };
    }
  } else {
    payload = { title: 'Notifikasi', body: 'Anda punya pesan baru.' };
  }

  const title = payload.title || 'Story App';
  const options = {
    body: payload.body || 'Ada cerita baru untuk Anda!',
    icon: '/icons/favicon.png', 
    badge: '/icons/favicon.png', 
    data: {
      url: payload.url || '/', 
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notifikasi diklik:', event.notification);
  
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});