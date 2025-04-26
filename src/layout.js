// src/layout.js
import { auth, db } from './firebase-init.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Carregar nome da loja
  try {
    if (auth.currentUser) {
      const comercioRef = doc(db, 'comercios', auth.currentUser.uid);
      const comercioSnap = await getDoc(comercioRef);
      if (comercioSnap.exists()) {
        const comercioData = comercioSnap.data();
        document.getElementById('store-name').textContent = comercioData.nome || 'Minha Loja';
        if (comercioData.logoUrl) {
          document.getElementById('store-logo').src = comercioData.logoUrl;
        }
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados da loja:', error);
  }

  // Destacar página ativa
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#sidebar a.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Carregar banners do CSV
  async function loadBannersFromCSV() {
    try {
      console.log('Iniciando carregamento do CSV...');
      const response = await fetch('src/db/arquivo.csv');
      if (!response.ok) throw new Error(`Erro ao carregar CSV: ${response.status}`);
      const csvText = await response.text();
      console.log('CSV carregado:', csvText);

      // Parse CSV
      const rows = csvText.split('\n').map(row => row.split(','));
      const headers = rows[0];
      console.log('Headers do CSV:', headers);
      const banners = rows.slice(1).map(row => {
        const banner = {};
        headers.forEach((header, index) => {
          banner[header.trim()] = row[index]?.trim();
        });
        return banner;
      }).filter(banner => banner.link_foto_principal);
      console.log('Banners processados:', banners);

      // Adicionar banners ao carrossel
      const carousel = document.querySelector('#banner-aside .carousel-container');
      if (!carousel) {
        console.error('Carousel container não encontrado');
        return;
      }

      // Criar elementos de banner
      banners.forEach(banner => {
        const bannerDiv = document.createElement('div');
        bannerDiv.className = 'banner-ad';
        bannerDiv.innerHTML = `
          <div class="card">
            <a href="${banner.link_produto || '#'}" target="_blank">
              <img src="${banner.link_foto_principal}" alt="${banner.nome_produto || 'Produto'}" onerror="this.src='https://via.placeholder.com/100?text=Imagem+Indisponível'">
            </a>
          </div>
        `;
        carousel.appendChild(bannerDiv);
      });
      console.log('Banners adicionados ao DOM');

      // Duplicar banners para loop contínuo
      const bannerElements = document.querySelectorAll('#banner-aside .banner-ad');
      bannerElements.forEach(banner => {
        const clone = banner.cloneNode(true);
        carousel.appendChild(clone);
      });
      console.log('Banners duplicados:', bannerElements.length * 2);

      // Configurar carrossel
      const bannerHeight = 120 + 12; // 120px (card) + 12px (margin-bottom)
      let currentIndex = 0;
      const totalBanners = bannerElements.length / 2; // Original, sem duplicatas
      const visibleBanners = 3;

      function rotateCarousel() {
        currentIndex++;
        console.log('Rotacionando carrossel, índice:', currentIndex);
        if (currentIndex > totalBanners - visibleBanners) {
          // Resetar para o início sem animação
          carousel.style.transition = 'none';
          carousel.style.transform = `translateY(0px)`;
          currentIndex = 1;
          // Forçar reflow para reativar a transição
          carousel.offsetHeight;
          carousel.style.transition = 'transform 0.5s ease-in-out';
        }
        carousel.style.transform = `translateY(-${currentIndex * bannerHeight}px)`;
      }

      // Iniciar carrossel se houver banners suficientes
      if (bannerElements.length > 0) {
        console.log('Iniciando carrossel com', bannerElements.length / 2, 'banners');
        setInterval(rotateCarousel, 5000); // Alternar a cada 5 segundos
      } else {
        console.warn('Nenhum banner válido encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      // Fallback: Adicionar banner padrão
      const carousel = document.querySelector('#banner-aside .carousel-container');
      if (carousel) {
        carousel.innerHTML = `
          <div class="banner-ad">
            <div class="card">
              <a href="#" target="_blank">
                <img src="https://via.placeholder.com/100?text=Erro" alt="Erro ao carregar">
              </a>
            </div>
          </div>
        `;
      }
    }
  }

  // Executar carregamento dos banners
  await loadBannersFromCSV();
});