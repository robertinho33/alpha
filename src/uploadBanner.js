// src/uploadBanner.js
import { storage } from './firebase-init.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js';

async function uploadBanner(file, bannerId) {
  const storageRef = ref(storage, `banners/${bannerId}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

const fileInput = document.getElementById('bannerInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const url = await uploadBanner(file, 'banner1');
  console.log(`Banner URL: ${url}`);
});