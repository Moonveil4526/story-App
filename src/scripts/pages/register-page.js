import API from '../data/api';

const Register = {
  async render() {
    return `
      <section>
        <h2>Daftar Akun Baru</h2>
        <form id="register-form">
          <label for="reg-name">Nama:</label>
          <input type="text" id="reg-name" name="name" required aria-label="Nama Lengkap">
          
          <label for="reg-email">Email:</label>
          <input type="email" id="reg-email" name="email" required aria-label="Alamat Email">
          
          <label for="reg-password">Password:</label>
          <input type="password" id="reg-password" name="password" required aria-label="Password Akun">
          
          <button type="submit">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;

      const success = await API.userRegister({ name, email, password });

      if (success) {
        window.location.hash = '#/login';
      }
    });
  },
};

export default Register;
