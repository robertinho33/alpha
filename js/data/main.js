// data/main.js
import './adminSignup.js';
import './storeSignup.js';
import './authManager.js';

console.log('Carregando main.js...');

if (window.location.pathname.includes('comecar.html')) {
    import('./adminSignup.js');
    import('./storeSignup.js');
}
if (window.location.pathname.includes('CONTATO.html')) {
    import('./CONTATO.js');
}
if (window.location.pathname.includes('dashboard.html')) {
    import('./dashboard.js');
}
if (window.location.pathname.includes('lojas.html')) {
    import('./lojas.js');
}

// Menu mobile
document.querySelector('.md\\:hidden').addEventListener('click', () => {
    const nav = document.querySelector('nav');
    nav.classList.toggle('hidden');
});
