import API from '../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const AddStory = {
  async render() {
    return `
      <div class="auth-container">
        <h2>Tambahkan Cerita Baru</h2>
        <form id="add-story-form">
          
          <label for="description">Deskripsi Cerita:</label>
          <textarea id="description" name="description" required aria-label="Deskripsi Cerita"></textarea>
          
          <label for="photo">Foto Cerita:</label>
          <input type="file" id="photo" name="photo" accept="image/*" required aria-label="Upload Foto Cerita">
          
          <div id="map-preview" style="height: 400px; border-radius: 8px; margin: 10px 0;"></div>
          <p class="text-center">Klik di peta untuk menentukan lokasi cerita (Latitude & Longitude)</p>
          
          <label for="lat">Latitude:</label>
          <input type="text" id="lat" name="lat" readonly required aria-label="Latitude lokasi cerita">
          
          <label for="lon">Longitude:</label>
          <input type="text" id="lon" name="lon" readonly required aria-label="Longitude lokasi cerita">
          
          <button type="submit">Submit Cerita</button>
        </form>
      </div>
    `;
  },

  async afterRender() {
    const form = document.getElementById('add-story-form');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');

    const map = L.map('map-preview').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const greenIcon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    let marker;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);

      if (marker) {
        map.removeLayer(marker);
      }

      marker = L.marker([lat, lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup('<b>Lokasi Cerita Anda</b>')
        .openPopup();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const storyData = {
        description: document.getElementById('description').value,
        photo: document.getElementById('photo').files[0],
        lat: latInput.value,
        lon: lonInput.value,
      };

      if (!storyData.lat || !storyData.lon) {
        alert('Harap tentukan lokasi cerita dengan mengklik peta.');
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Mengirim...';

      const success = await API.addNewStory(storyData);

      if (success) {
        ;
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.hash = '#/home';
      }

      submitButton.disabled = false;
      submitButton.textContent = 'Submit Cerita';
    });
  },
};

export default AddStory;
