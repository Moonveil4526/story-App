import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';


const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    }
  },
});

const StoryIdb = {
  async getAllStories() {
    console.log('Mengambil semua story dari IndexedDB...');
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putStory(story) {
    if (!story.id) {
      console.error('Objek story harus memiliki properti "id".');
      return;
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async putAllStories(stories) {
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await Promise.all(stories.map(story => store.put(story)));
    return tx.done;
  },
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryIdb;