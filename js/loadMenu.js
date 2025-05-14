document.addEventListener('DOMContentLoaded', () => {
    fetch('../partials/menu.html')
        .then(response => response.text())
        .then(data => document.getElementById('menu').innerHTML = data);
    
    fetch('../partials/footer.html')
        .then(response => response.text())
        .then(data => document.getElementById('footer').innerHTML = data);
});