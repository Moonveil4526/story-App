import urlBase64ToUint8Array from './url-base64-to-uint8array';
// Asumsi Anda punya file 'api.js' yang bisa mengirim data ke server
// import API from '../data/api'; 

//
// VAPID Public Key Anda sudah dimasukkan
//
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const NotificationHelper = {
  // Panggil init() dari app.js saat aplikasi dimuat
  async init() {
    if (!('PushManager' in window)) {
      console.warn('Push Messaging tidak didukung di browser ini.');
      return;
    }
    
    // Minta izin saat aplikasi dimuat (alternatif: gunakan tombol)
    await this._requestPermission();
  },

  // Meminta izin notifikasi
  async _requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Izin notifikasi tidak diberikan.');
        return;
      }
      
      console.log('Izin notifikasi diberikan.');
      // Jika izin diberikan, lakukan subscribe
      await this._subscribeToPush();
      
    } catch (error) {
      console.error('Gagal meminta izin notifikasi:', error);
    }
  },

  // Melakukan subscription ke push service
  async _subscribeToPush() {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true, // Selalu true
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Berhasil subscribe:', subscription.toJSON());

      //
      // PENTING: Kirim 'subscription' ini ke server Anda
      // (Aktifkan baris ini jika API Anda punya endpoint untuk menyimpannya)
      //
      // await API.saveSubscription(subscription.toJSON());
      // console.log('Subscription berhasil dikirim ke server.');

    } catch (error) {
      console.error('Gagal melakukan subscribe ke push service:', error);
    }
  },
};

export default NotificationHelper;