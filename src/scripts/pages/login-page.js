import API from '../data/api';

const Login = {
  async render() {
    return `
      <h2>Login ke Akun Anda</h2>
      <form id="login-form">
        <label for="login-email">Email:</label>
        <input type="email" id="login-email" name="email" required aria-label="Alamat Email">
        
        <label for="login-password">Password:</label>
        <input type="password" id="login-password" name="password" required aria-label="Password Akun">
        
        <button type="submit">Login</button>
      </form>
      <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
    `;
  },

  async afterRender() {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      const success = await API.userLogin({ email, password });

      if (success) {
        window.location.hash = '#/home';
      }
    });
  },
};

export default Login;
