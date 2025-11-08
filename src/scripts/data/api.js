import API_CONFIG from '../utils/config';

const getGuestStories = async () => {
  const token = localStorage.getItem('authToken'); 
  
  const headers = {};
  if (token) {
      headers['Authorization'] = `Bearer ${token}`; 
  }
  
  try {
    const response = await fetch(API_CONFIG.STORIES_GUEST, {
        method: 'GET',
        headers: headers,
    });
      
    if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status} ${response.statusText}`); 
    }
      
    const responseJson = await response.json();
      
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    
    return responseJson.listStory || responseJson.data?.stories || []; 
    
  } catch (error) {
    console.error('Error fetching stories:', error.message);
    Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat',
        text: 'Gagal memuat daftar cerita. Periksa koneksi atau URL API.', 
    });
    return []; 
  }
};


const addNewStory = async (storyData) => {
  const token = localStorage.getItem('authToken'); 
  if (!token) {
      Swal.fire('Akses Ditolak', 'Anda harus login untuk menambahkan cerita.', 'warning');
      return false;
  }
  
  const formData = new FormData();
  formData.append('description', storyData.description);
  formData.append('lat', storyData.lat);
  formData.append('lon', storyData.lon);
  formData.append('photo', storyData.photo);
  
  try {
    const response = await fetch(API_CONFIG.STORIES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
        let errorMessage = 'Gagal menambahkan cerita. Server error.';
        try {
            const errorJson = await response.json();
            errorMessage = errorJson.message || errorMessage;
        } catch(e) {  }
        throw new Error(errorMessage);
    }
      
    const responseJson = await response.json();
    if (responseJson.error) {
        throw new Error(responseJson.message);
    }
    
    Swal.fire('Berhasil!', 'Cerita baru berhasil ditambahkan!', 'success');
    return true;
    
  } catch (error) {
    console.error('Error adding new story:', error);
    Swal.fire('Gagal!', 'Gagal menambahkan cerita. ' + error.message, 'error');
    return false;
  }
};

const userLogin = async ({ email, password }) => {
  try {
    const response = await fetch(API_CONFIG.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json(); 

    if (!response.ok) {
        throw new Error(responseJson.message || 'Periksa kredensial Anda.');
    }
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    const { token, name, userId } = responseJson.loginResult; 

    localStorage.setItem('authToken', token);
    localStorage.setItem('userName', name);
    localStorage.setItem('userId', userId);
    
    Swal.fire('Berhasil Login!', `Selamat datang, ${name}!`, 'success');
    return true; 
    
  } catch (error) {
    console.error('Login error:', error);
    Swal.fire('Login Gagal', error.message, 'error');
    return false;
  }
};

const userRegister = async ({ name, email, password }) => {
  try {
    const response = await fetch(API_CONFIG.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json(); 

    if (response.ok) {
        if (responseJson.error) {
            throw new Error(responseJson.message);
        }
        Swal.fire('Registrasi Berhasil!', 'Akun berhasil dibuat. Silakan login.', 'success');
        return true; 
    } else {
        throw new Error(responseJson.message || `Server merespons ${response.status}.`);
    }

  } catch (error) {
    console.error('Register error:', error);
    Swal.fire('Registrasi Gagal', error.message, 'error');
    return false;
  }
};

const API = {
  getGuestStories,
  addNewStory,
  userLogin, 
  userRegister, 
};

export default API;
