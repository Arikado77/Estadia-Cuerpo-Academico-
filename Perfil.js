document.addEventListener('DOMContentLoaded', async () => {
    
    // ===============================================
    // 1. CARGAR DATOS DEL PERFIL
    // ===============================================
    async function cargarDatosPerfil() {
        try {
            const response = await fetch('/api/usuario/perfil');
            const data = await response.json();

            if (data.success) {
                const user = data.user;

                // Llenar textos estáticos
                document.getElementById('user-email').textContent = user.email;
                document.getElementById('user-name-display').textContent = user.nombre || 'Usuario';
                
                // Cargar foto (Asegúrate de que el ID en el HTML sea 'display-photo')
                if (user.foto_url) {
                    // Quitamos duplicados de ruta si los hubiera
                    document.getElementById('display-photo').src = user.foto_url;
                }

                // Llenar inputs del formulario
                document.getElementById('full-name').value = user.nombre || '';
                document.getElementById('university').value = user.universidad || '';
                document.getElementById('city-state').value = user.ciudad_estado || '';
                document.getElementById('research-line').value = user.linea_investigacion || '';
                document.getElementById('google-profile').value = user.perfil_google_url || '';
                document.getElementById('orcid').value = user.orcid_id || '';
                
                // Actualizar vista previa académica
                document.getElementById('preview-line').textContent = user.linea_investigacion || 'No definida';
                document.getElementById('preview-uni').textContent = user.universidad || 'No definida';

            } else {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
        }
    }

    cargarDatosPerfil();

    // ===============================================
    // 2. ACTUALIZAR INFORMACIÓN BÁSICA
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
                if (res.ok) {
                    alert("✅ " + (result.mensaje || "Perfil actualizado"));
                    // Refrescar visualmente sin recargar
                    document.getElementById('user-name-display').textContent = datos.nombre;
                    document.getElementById('preview-line').textContent = datos.linea_investigacion;
                    document.getElementById('preview-uni').textContent = datos.universidad;
                } else {
                    alert("❌ " + result.error);
                }
            } catch (error) {
                alert("Error de conexión al actualizar.");
            }
        });
    }

    // ===============================================
    // 3. CAMBIO DE FOTO DE PERFIL (UPLOAD)
    // ===============================================
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        // Creamos el input de archivo oculto una sola vez
        const photoInput = document.createElement('input');
        photoInput.type = 'file';
        photoInput.accept = 'image/*';
        
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            photoInput.click();
        });

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
                    // Forzamos actualización de la imagen con un timestamp para evitar caché
                    document.getElementById('display-photo').src = data.url + '?t=' + new Date().getTime();
                    alert("✅ ¡Foto actualizada correctamente!");
                } else {
                    alert("❌ Error: " + (data.error || "No se pudo subir la foto"));
                }
            } catch (error) {
                alert("Error al subir la imagen al servidor.");
            }
        });
    }

    // ===============================================
    // 4. CAMBIO DE CONTRASEÑA (SEGURIDAD)
    // ===============================================
    // Buscamos específicamente el botón que tiene el icono de candado
    const passBtn = document.querySelector('.bx-lock-alt')?.closest('li') || document.querySelector('.bx-lock-alt')?.parentElement;

    if (passBtn) {
        passBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const actual = prompt("🔑 Ingresa tu contraseña ACTUAL:");
            if (!actual) return;

            const nueva = prompt("🆕 Ingresa tu NUEVA contraseña (mínimo 6 caracteres):");
            if (!nueva) return;
            if (nueva.length < 6) return alert("⚠️ Contraseña muy corta.");

            try {
                const res = await fetch('/api/usuario/cambiar-contrasena', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passwordActual: actual, passwordNueva: nueva })
                });
                
                const data = await res.json();
                if (data.success) {
                    alert("✅ " + data.mensaje);
                } else {
                    alert("❌ " + (data.error || "Error al cambiar contraseña"));
                }
            } catch (error) {
                alert("Error de conexión al intentar cambiar contraseña.");
            }
        });
    }

    // ===============================================
    // 5. CERRAR SESIÓN (LOGOUT)
    // ===============================================
    const logoutBtn = document.querySelector('.bx-log-out')?.closest('li') || document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
                try {
                    const res = await fetch('/api/logout', { method: 'POST' });
                    if (res.ok) {
                        window.location.href = 'login.html';
                    }
                } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                }
            }
        });
    }
});