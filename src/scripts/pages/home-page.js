import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../data/api';
import StoryIdb from '../data/story-idb'; 

const Home = {
  async render() {
    return `
      <section id="story-list-section" class="mb-10">
        <h2 class="text-3xl font-bold mb-6 border-b pb-2">Cerita Terbaru</h2>
        <div id="story-list" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p class="text-center col-span-full text-gray-500 p-8">Loading stories...</p>
        </div>
      </section>

      <section id="bookmarked-story-section" class="mb-10 mt-10">
        <h2 class="text-3xl font-bold mb-6 border-b pb-2">Cerita Favorit</h2>
        <div id="bookmarked-story-list" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <p class="text-center col-span-full text-gray-500 p-8">Memuat cerita tersimpan...</p>
        </div>
      </section>
      
      <section id="map-section" class="mt-10">
        <h2 class="text-3xl font-bold  mb-6 border-b pb-2">Peta Lokasi Cerita</h2>
        <div id="story-map" style="height: 550px; width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
      </section>
    `;
  },

  async afterRender() {
    await this._renderFromIDB();

    
    await this._renderFromNetwork();
  },

  
  async _renderFromIDB() {
    const bookmarkedListContainer = document.getElementById('bookmarked-story-list');
    try {
      const stories = await StoryIdb.getAllStories();
      console.log('Menampilkan data dari IndexedDB (Bookmark)');
      
      
      this._renderStoryList(stories, bookmarkedListContainer, { isBookmarkedList: true });
      
    } catch (error) {
      console.error('Gagal mengambil data dari IDB:', error);
      bookmarkedListContainer.innerHTML = '<p class="text-center col-span-full text-gray-500 p-10">Gagal memuat cerita tersimpan.</p>';
    }
  },

  
  async _renderFromNetwork() {
    const storyListContainer = document.getElementById('story-list');
    try {
      const stories = await API.getGuestStories(); 
      
      console.log('Menampilkan data dari Network');
      
      this._renderStoryList(stories, storyListContainer, { isBookmarkedList: false });
      
      this._initMap(stories); 
      
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

  _renderStoryList(stories, container, options = { isBookmarkedList: false }) {
    if (stories.length === 0) {
      container.innerHTML = `<p class="text-center col-span-full text-gray-500 p-10">${options.isBookmarkedList ? 'Belum ada cerita yang Anda simpan.' : 'Belum ada cerita terbaru.'}</p>`;
      return;
    }

    container.innerHTML = stories
      .map((story) => {
        const photoUrl = story.photoUrl || story.photo || 'https://placehold.co/400x200/cccccc/333333?text=No+Image';
        const storyName = story.name || 'Untitled Story';

        const actionButton = options.isBookmarkedList
          ? `<button 
               class="delete-button absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full shadow-lg hover:bg-red-700 transition duration-200"
               data-id="${story.id}" 
               title="Hapus story dari daftar tersimpan">
               &times;
             </button>`
          : `<button 
               class="bookmark-button absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
               data-story='${JSON.stringify(story)}' 
               title="Simpan story untuk offline">
               &#43;
             </button>`;

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
          
          ${actionButton}

        </article>
      `;
      })
      .join('');
      
    if (options.isBookmarkedList) {
      this._addDeleteListeners(container.id);
    } else {
      this._addBookmarkListeners(container.id);
    }
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
    });

    let bounds = [];
    stories.forEach((story) => {
      if (story.lat && story.lon) {
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  },

  _addBookmarkListeners(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('click', async (event) => {
      const button = event.target.closest('.bookmark-button');
      if (!button) return;

      try {
        const storyData = JSON.parse(button.dataset.story);

        await StoryIdb.putStory(storyData);
        
        alert(`Cerita "${storyData.name}" berhasil disimpan untuk mode offline!`);
        
        this._renderFromIDB();

      } catch (error) {
        console.error('Gagal menyimpan story ke IDB:', error);
        alert('Gagal menyimpan cerita.');
      }
    });
  },
  
  _addDeleteListeners(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('click', async (event) => {
      const button = event.target.closest('.delete-button');
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();
      
      const id = button.dataset.id;
      
      if (!confirm('Apakah Anda yakin ingin menghapus story ini dari daftar tersimpan?')) {
        return;
      }

      try {
        await StoryIdb.deleteStory(id);
        console.log(`Story ${id} dihapus dari IndexedDB`);

        alert('Story berhasil dihapus dari database lokal.');
        
        this._renderFromIDB();

      } catch (error) {
        console.error('Gagal menghapus story:', error);
        alert('Gagal menghapus story.');
      }
    });
  },
};

export default Home;