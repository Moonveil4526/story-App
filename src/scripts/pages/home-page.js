import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../data/api';
import StoryIdb from '../data/story-idb'; 

const Home = {
  async render() {
    return `
      <section id="story-list-section" class="mb-10">
        <h2 class="text-3xl font-bold mb-6 border-b pb-2">Daftar Cerita Terbaru</h2>
        <div id="story-list" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p class="text-center col-span-full text-gray-500 p-8">Loading stories...</p>
        </div>
      </section>
      
      <section id="map-section" class="mt-10">
        <h2 class="text-3xl font-bold  mb-6 border-b pb-2">Peta Lokasi Cerita</h2>
        <div id="story-map" style="height: 550px; width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
      </section>
    `;
  },

  async afterRender() {
    const storyListContainer = document.getElementById('story-list');
    
    await this._renderFromIDB(storyListContainer);

    await this._renderFromNetwork(storyListContainer);
  },

  async _renderFromIDB(storyListContainer) {
    try {
      const stories = await StoryIdb.getAllStories();
      if (stories.length > 0) {
        console.log('Menampilkan data dari IndexedDB');
        this._renderStoryList(stories, storyListContainer);
        this._initMap(stories);
      }
    } catch (error) {
      console.error('Gagal mengambil data dari IDB:', error);
    }
  },

  async _renderFromNetwork(storyListContainer) {
    try {
      const stories = await API.getGuestStories(); 
      
      console.log('Menampilkan data dari Network');
      this._renderStoryList(stories, storyListContainer); 
      this._initMap(stories); 
      
      await StoryIdb.putAllStories(stories);
      console.log('Data network berhasil disimpan ke IndexedDB');

    } catch (error) {
      console.error('Gagal mengambil data dari Network:', error);
      if (storyListContainer.innerHTML.includes('Loading stories...')) {
        storyListContainer.innerHTML = `
          <p class="text-center col-span-full text-gray-500 p-10">
            Gagal memuat cerita. Periksa koneksi internet Anda.
          </p>`;
      }
    }
  },
  _renderStoryList(stories, storyListContainer) {
    if (stories.length === 0) {
      storyListContainer.innerHTML = `
        <p class="text-center col-span-full text-gray-500 p-10">
          Belum ada cerita terbaru. Silakan <a href="#/add" class="text-green-600 hover:underline font-semibold">tambahkan cerita</a> Anda setelah login!
        </p>`;
      return;
    }

    storyListContainer.innerHTML = stories
      .map((story) => {
        const photoUrl = story.photoUrl || story.photo || 'https://placehold.co/400x200/cccccc/333333?text=No+Image';
        const storyName = story.name || 'Untitled Story';

        return `
        <article class="bg-white rounded-xl shadow-lg overflow-hidden transition transform hover:shadow-xl duration-300 relative">
          <img src="${photoUrl}" 
               alt="Gambar cerita dari ${storyName}" 
               class="w-full h-48 object-cover" 
               loading="lazy"
               onerror="this.onerror=null; this.src='https://placehold.co/400x200/cccccc/333333?text=Load+Error';">
          <div class="p-4">
            <h3 class="text-xl font-bold mb-2">${storyName}</h3>
            <p class="text-gray-600 text-sm mb-3">${(story.description || 'No description provided.').substring(0, 100)}...</p>
            <p class="text-xs text-gray-400">Lokasi: ${story.lat ? `${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}` : 'N/A'}</p>
          </div>
          
          <button 
            class="delete-button absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full shadow-lg hover:bg-red-700 transition duration-200"
            data-id="${story.id}" 
            title="Hapus story">
            &times;
          </button>
        </article>
      `;
      })
      .join('');
      
    this._addDeleteListeners();
  },

  _initMap(stories) {
    const mapContainer = document.getElementById('story-map');
    if (mapContainer && mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }
    mapContainer.innerHTML = ''; 

    const map = L.map('story-map', { scrollWheelZoom: false }).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      shadowSize: [41, 41],
    });

    let bounds = [];
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const latLng = [story.lat, story.lon];
        bounds.push(latLng);

        L.marker(latLng, { icon: customIcon }).addTo(map).bindPopup(`
          <div class="p-1 max-w-xs">
            <strong class="text-md">${story.name || 'Story'}</strong><br>
            <img src="${story.photoUrl || story.photo || 'https://placehold.co/100x75'}" alt="Foto ${story.name || 'Story'}" class="w-full h-auto mt-1 rounded">
            <p class="text-xs mt-1">${(story.description || '').substring(0, 50)}...</p>
          </div>
        `);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  },

  _addDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      newButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const id = event.target.closest('.delete-button').dataset.id;
        
        if (!confirm('Apakah Anda yakin ingin menghapus story ini?')) {
          return;
        }

        try {
          await StoryIdb.deleteStory(id);
          console.log(`Story ${id} dihapus dari IndexedDB`);
          try {
            console.log(`Story ${id} dihapus dari API`);
          } catch (apiError) {
            console.warn('Gagal menghapus dari API. Mungkin sedang offline.', apiError);
          }

          alert('Story berhasil dihapus dari database lokal.');
          
          const storyListContainer = document.getElementById('story-list');
          this._renderFromIDB(storyListContainer);

        } catch (error) {
          console.error('Gagal menghapus story:', error);
          alert('Gagal menghapus story.');
        }
      });
    });
  },
};

export default Home;