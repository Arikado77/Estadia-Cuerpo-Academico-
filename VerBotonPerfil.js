document.addEventListener('DOMContentLoaded', () => {
    const authLinkContainer = document.getElementById('auth-link');

    const renderUserMenu = (name) => {
        const firstName = name ? name.split(' ')[0] : 'Usuario';
        authLinkContainer.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-button">Hola, ${firstName} ▼</button>
                <div class="dropdown-content">
                    <a href="Perfil.html"><i class='bx bx-user'></i> Ver Perfil</a>
                    <a href="#" id="logout-general"><i class='bx bx-log-out'></i> Cerrar Sesión</a>
                </div>
            </div>
        `;

        // Evento Logout
        document.getElementById('logout-general').addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = 'index.html'; // Al cerrar sesión mandamos al inicio
        });

        // Toggle del menú
        const btn = authLinkContainer.querySelector('.profile-button');
        const dropdown = authLinkContainer.querySelector('.dropdown-content');
        btn.onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show-dropdown');
        };
    };

    // Consultar sesión
    fetch('/api/usuario/perfil')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderUserMenu(data.user.nombre);
            }
        });
});