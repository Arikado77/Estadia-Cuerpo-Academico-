const userLoggedIn = localStorage.getItem('userLoggedIn');
if (userLoggedIn !== 'true') {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    const userRole = localStorage.getItem('userRole');

    // Si no ha iniciado sesión, redirige al login
    if (userLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Si el usuario es administrador, muestra las opciones de edición
    if (userRole === 'admin') {
        document.getElementById('admin-panel').style.display = 'block';

        const editButtons = document.querySelectorAll('.edit-buttons');
        editButtons.forEach(button => {
            button.style.display = 'flex';
        });
    }
});

function setupAdminFunctions() {
    const newsSection = document.querySelector('.noticias-section');
    
    // Función para crear un nuevo item de noticia
    function createNewsItem(title, description) {
        const newItem = document.createElement('div');
        newItem.className = 'noticia-item';
        newItem.innerHTML = `
            <div class="edit-buttons" style="display:flex;">
                <button class="edit-button">✏️</button>
                <button class="delete-button">🗑️</button>
            </div>
            <h3>${title}</h3>
            <p>${description}</p>
            <a href="#" class="read-more">Leer más</a>
        `;
        // Agrega event listeners a los nuevos botones
        newItem.querySelector('.edit-button').addEventListener('click', handleEdit);
        newItem.querySelector('.delete-button').addEventListener('click', handleDelete);
        return newItem;
    }

    // Funcionalidad de agregar noticia
    const addButton = document.querySelector('.add-button'); // Asume que es el primer botón de agregar
    addButton.addEventListener('click', () => {
        const title = prompt("Ingresa el título de la nueva noticia:");
        if (title) {
            const description = prompt("Ingresa la descripción de la noticia:");
            if (description) {
                const newItem = createNewsItem(title, description);
                newsSection.appendChild(newItem);
                alert("Noticia agregada con éxito.");
            }
        }
    });

    // Funcionalidad de edición (para elementos ya existentes y nuevos)
    function handleEdit(event) {
        const item = event.target.closest('.noticia-item');
        const titleElement = item.querySelector('h3');
        const descElement = item.querySelector('p');

        const newTitle = prompt("Edita el título:", titleElement.textContent);
        if (newTitle !== null && newTitle.trim() !== '') {
            titleElement.textContent = newTitle;
        }

        const newDesc = prompt("Edita la descripción:", descElement.textContent);
        if (newDesc !== null && newDesc.trim() !== '') {
            descElement.textContent = newDesc;
        }
        alert("Noticia editada con éxito.");
    }

    // Funcionalidad de eliminación
    function handleDelete(event) {
        const item = event.target.closest('.noticia-item');
        if (confirm("¿Estás seguro de que quieres eliminar esta noticia?")) {
            item.remove();
            alert("Noticia eliminada.");
        }
    }

    // Agrega listeners a los botones existentes
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', handleEdit);
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', handleDelete);
    });
}