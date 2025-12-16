document.addEventListener('DOMContentLoaded', async () => {
    
    // Función para cargar datos desde el servidor
    async function cargarDatosPerfil() {
        try {
            const response = await fetch('/api/usuario/perfil');
            const data = await response.json();

            if (data.success) {
                const user = data.user;

                // Llenar datos de visualización
                document.getElementById('user-email').textContent = user.email;
                // Si quieres mostrar el nombre en el sidebar:
                // document.getElementById('user-role').textContent = user.nombre; 

                // Llenar el formulario de edición con datos de la DB
                document.getElementById('full-name').value = user.nombre || '';
                document.getElementById('university').value = user.universidad || '';
                document.getElementById('city-state').value = user.ciudad_estado || '';
                document.getElementById('research-line').value = user.linea_investigacion || '';
                document.getElementById('google-profile').value = user.perfil_google_url || '';
                document.getElementById('orcid').value = user.orcid_id || '';
            } else {
                // Si no hay sesión, mandar al login
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        }
    }

    // Ejecutar la carga al iniciar
    cargarDatosPerfil();

    // Lógica de Logout mejorada
    const logoutButton = document.querySelector('.bx-log-out')?.parentElement;
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            // Aquí deberías llamar a una ruta de /logout en tu servidor para destruir la sesión
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = 'login.html';
        });
    }
});