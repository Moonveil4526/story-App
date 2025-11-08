import urlBase64ToUint8Array from './url-base64-to-uint8array';
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const NotificationHelper = {
  async init() {
    if (!('PushManager' in window)) {
      console.warn('Push Messaging tidak didukung di browser ini.');
      return;
    }
    
    
    await this._requestPermission();
  },

  
  async _requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Izin notifikasi tidak diberikan.');
        return;
      }
      
      console.log('Izin notifikasi diberikan.');
      await this._subscribeToPush();
      
    } catch (error) {
      console.error('Gagal meminta izin notifikasi:', error);
    }
  },

  async _subscribeToPush() {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true, // Selalu true
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('Berhasil subscribe:', subscription.toJSON());

    } catch (error) {
      console.error('Gagal melakukan subscribe ke push service:', error);
    }
  },
};

export default NotificationHelper;
