// src/loadBanners.js
import { db } from './firebase-init.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

async function loadBanners() {
  const bannersRef = collection(db, 'banners');
  const bannersSnap = await getDocs(bannersRef);
  const banners = bannersSnap.docs.map(doc => doc.data());
  const bannerContainer = document.querySelector('#banner-aside');
  bannerContainer.querySelectorAll('.banner-ad').forEach((bannerDiv, index) => {
    if (banners[index]) {
      bannerDiv.innerHTML = `
        <a href="${banners[index].link}" target="_blank">
          <img src="${banners[index].imageUrl}" alt="${banners[index].alt}" class="w-full h-full object-contain rounded">
        </a>
      `;
      if (index === 0) bannerDiv.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', loadBanners);