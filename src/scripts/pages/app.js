import UrlParser from '../utils/url-parser';
import routes from '../routes/routes';
import NotificationHelper from '../utils/notification-helper';

class App {
  constructor({ content }) {
    this._content = content;
    this._initialSetup();
  }

  _initialSetup() {
    this._setupLogoutHandler();
    this._updateNav();
    this._registerServiceWorker();
  }

  _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered: ', registration);
            NotificationHelper.init();
          })
          .catch(registrationError => {
            console.log('Service Worker registration failed: ', registrationError);
          });
      });
    }
  }

  _setupLogoutHandler() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', this._logoutUser.bind(this));
    }
  }

  _logoutUser(event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    Swal.fire({
        title: 'Berhasil Logout',
        text: 'Anda telah keluar dari sesi.',
        icon: 'success',
        timer: 1500, 
        showConfirmButton: false
    });
    
    this._updateNav();
    window.location.hash = '#/login';
  }

  _updateNav() {
    const authLink = document.getElementById('auth-link');
    const logoutButton = document.getElementById('logout-button');
    const token = localStorage.getItem('authToken');

    if (token) {
      if (authLink) authLink.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'inline-block';
    } else {
      if (authLink) {
        authLink.href = '#/login';
        authLink.textContent = 'Login';
        authLink.style.display = 'inline-block';
      }
      if (logoutButton) logoutButton.style.display = 'none';
    }
  }

  async renderPage() {
    this._updateNav();

    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/'];

    if (page) {
      this._content.innerHTML = await page.render();
      await page.afterRender();
    } else {
      this._content.innerHTML = '<h2>404 Page Not Found</h2>';
    }
  }
}

export default App;