document.addEventListener('DOMContentLoaded', async () => {
    
    // ===============================================
    // 1. CARGAR DATOS DEL PERFIL (CONSULTA)
    // ===============================================
    async function cargarDatosPerfil() {
        try {
            const response = await fetch('/api/usuario/perfil');
            const data = await response.json();

            if (data.success) {
                const user = data.user;

                // Llenar datos de visualización (Texto estático)
                document.getElementById('user-email').textContent = user.email;
                document.getElementById('user-name-display').textContent = user.nombre || 'Usuario';
                
                // Cargar foto si existe en la base de datos
                if (user.foto_url) {
                    document.getElementById('display-photo').src = user.foto_url;
                }

                // Llenar el formulario de edición (Inputs)
                document.getElementById('full-name').value = user.nombre || '';
                document.getElementById('university').value = user.universidad || '';
                document.getElementById('city-state').value = user.ciudad_estado || '';
                document.getElementById('research-line').value = user.linea_investigacion || '';
                document.getElementById('google-profile').value = user.perfil_google_url || '';
                document.getElementById('orcid').value = user.orcid_id || '';
                
                // Actualizar la vista previa académica al final
                document.getElementById('preview-line').textContent = user.linea_investigacion || 'No definida';
                document.getElementById('preview-uni').textContent = user.universidad || 'No definida';

            } else {
                // Si el servidor dice que no hay sesión, mandamos al login
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        }
    }

    // Ejecutar la carga inicial
    cargarDatosPerfil();

    // ===============================================
    // 2. ACTUALIZAR INFORMACIÓN BÁSICA (UPDATE)
    // ===============================================
    const perfilForm = document.getElementById('perfil-form');
    if (perfilForm) {
        perfilForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datos = {
                nombre: document.getElementById('full-name').value,
                universidad: document.getElementById('university').value,
                ciudad_estado: document.getElementById('city-state').value,
                linea_investigacion: document.getElementById('research-line').value,
                perfil_google_url: document.getElementById('google-profile').value,
                orcid_id: document.getElementById('orcid').value
            };

            try {
                const res = await fetch('/api/usuario/actualizar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const result = await res.json();
                alert(result.mensaje || result.error);
                
                // Refrescar los textos de visualización
                document.getElementById('user-name-display').textContent = datos.nombre;
                document.getElementById('preview-line').textContent = datos.linea_investigacion;
                document.getElementById('preview-uni').textContent = datos.universidad;
                
            } catch (error) {
                alert("Error al conectar con el servidor para actualizar.");
            }
        });
    }

    // ===============================================
    // 3. CAMBIO DE FOTO DE PERFIL
    // ===============================================
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        const photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.accept = 'image/*';
        
        uploadBtn.addEventListener('click', () => photoInput.click());

        photoInput.addEventListener('change', async () => {
            const file = photoInput.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('foto', file);

            try {
                const res = await fetch('/api/usuario/foto', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                
                if (data.success) {
                    document.getElementById('display-photo').src = data.url;
                    alert("¡Foto actualizada correctamente!");
                }
            } catch (error) {
                alert("Error al subir la imagen.");
            }
        });
    }

    // ===============================================
    // 4. CAMBIO DE CONTRASEÑA
    // ===============================================
    const passBtn = document.querySelector('.bx-lock-alt')?.parentElement;
    if (passBtn) {
        passBtn.addEventListener('click', async () => {
            const actual = prompt("Ingresa tu contraseña actual:");
            if (!actual) return;
            const nueva = prompt("Ingresa tu NUEVA contraseña (mínimo 6 caracteres):");
            if (!nueva || nueva.length < 6) return alert("Contraseña muy corta.");

            try {
                const res = await fetch('/api/usuario/cambiar-contrasena', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva })
                });
                const data = await res.json();
                alert(data.mensaje || data.error);
            } catch (error) {
                alert("Error al intentar cambiar la contraseña.");
            }
        });
    }

    // ===============================================
    // 5. CERRAR SESIÓN (LOGOUT)
    // ===============================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/logout', { method: 'POST' });
                if (res.ok) {
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        });
    }
});