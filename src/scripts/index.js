import App from './pages/app';
import '../styles/styles.css';

const app = new App({
  content: document.querySelector('#main-content'),
});

window.addEventListener('hashchange', () => {
    if (document.startViewTransition) {
        document.startViewTransition(() => {
            app.renderPage();
        });
    } else {
        
        app.renderPage();
    }
});

window.addEventListener('load', () => {
  app.renderPage();
});
