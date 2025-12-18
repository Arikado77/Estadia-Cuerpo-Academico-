document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('avatar-grid');
    const sectionAvatars = document.getElementById('section-avatars');
    const btnToggle = document.getElementById('btn-toggle-avatars');
    let selectedAvatar = '';

    // ===============================================
    // 1. CARGAR DATOS DEL PERFIL
    // ===============================================
    async function cargarDatosPerfil() {
        try {
            const response = await fetch('/api/usuario/perfil');
            const data = await response.json();

            if (data.success) {
                const user = data.user;
                // Actualizar Nombre en los 3 lugares
                document.getElementById('user-name-title').textContent = user.nombre || 'Miembro CA';
                document.getElementById('user-name-display').textContent = user.nombre || 'Usuario';
                document.getElementById('full-name').value = user.nombre || '';
                
                document.getElementById('user-email').textContent = user.email;
                
                // Cargar Foto Real
                if (user.foto_url) {
                    document.getElementById('display-photo').src = user.foto_url;
                }

                // Llenar inputs de información
                document.getElementById('university').value = user.universidad || '';
                document.getElementById('city-state').value = user.ciudad_estado || '';
                document.getElementById('research-line').value = user.linea_investigacion || '';
                document.getElementById('google-profile').value = user.perfil_google_url || '';
                document.getElementById('orcid').value = user.orcid_id || '';
                document.getElementById('bio').value = user.resumen_profesional || '';
                
                // Vista Previa
                document.getElementById('preview-line').textContent = user.linea_investigacion || 'No definida';
                document.getElementById('preview-uni').textContent = user.universidad || 'No definida';

            } else {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
        }
    }
    cargarDatosPerfil();

    // ===============================================
    // 2. MOSTRAR / OCULTAR SECCIÓN DE AVATARES
    // ===============================================
    btnToggle.onclick = () => {
        if (sectionAvatars.style.display === 'none') {
            sectionAvatars.style.display = 'block';
            btnToggle.innerHTML = "<i class='bx bx-x'></i> Cancelar";
        } else {
            sectionAvatars.style.display = 'none';
            btnToggle.innerHTML = "<i class='bx bx-refresh'></i> Cambiar Foto";
        }
    };

    // ===============================================
    // 3. GENERAR LOS AVATARES (Con tus nombres reales)
    // ===============================================
    // He puesto los nombres exactos que vi en tu captura de archivos
    const misAvatars = [
        '7309681.jpg', '9334175.jpg', '9434619.jpg', '9434937.jpg', 
        '9439779.jpg', '9440461.jpg', '9720026.jpg', '9723580.jpg', 
        '10491830.jpg', '10491843.jpg', '11475224.jpg'
    ];

    misAvatars.forEach(nombre => {
        const img = document.createElement('img');
        img.src = `/img/avatars/${nombre}`; 
        img.className = 'avatar-item';
        
        // Manejo de error por si acaso
        img.onerror = function() {
            this.style.display = 'none';
        };

        img.onclick = () => {
            document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
            selectedAvatar = img.src; // Guardamos la ruta completa para la DB
        };
        grid.appendChild(img);
    });

    // ===============================================
    // 4. GUARDAR SELECCIÓN DE AVATAR
    // ===============================================
    document.getElementById('save-avatar-btn').onclick = async () => {
        if (!selectedAvatar) return alert("Selecciona un avatar primero");

        const res = await fetch('/api/usuario/actualizar-avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatarUrl: selectedAvatar })
        });

        if (res.ok) {
            alert("✅ Imagen actualizada");
            document.getElementById('display-photo').src = selectedAvatar;
            sectionAvatars.style.display = 'none';
            btnToggle.innerHTML = "<i class='bx bx-refresh'></i> Cambiar Foto";
        } else {
            alert("Error al guardar el avatar.");
        }
    };

    // ===============================================
    // 5. FORMULARIO DE ACTUALIZAR DATOS (CORREGIDO)
    // ===============================================
    document.getElementById('perfil-form').onsubmit = async (e) => {
        e.preventDefault();
        
        // Agregamos 'resumen_profesional' a la lista para que se guarde
        const datos = {
            nombre: document.getElementById('full-name').value,
            universidad: document.getElementById('university').value,
            ciudad_estado: document.getElementById('city-state').value,
            linea_investigacion: document.getElementById('research-line').value,
            perfil_google_url: document.getElementById('google-profile').value,
            orcid_id: document.getElementById('orcid').value,
            resumen_profesional: document.getElementById('bio').value // <-- ESTA LÍNEA FALTABA
        };

        try {
            const res = await fetch('/api/usuario/actualizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                alert("✅ Información actualizada correctamente");
                // Actualizamos los textos de la página
                document.getElementById('user-name-title').textContent = datos.nombre;
                document.getElementById('user-name-display').textContent = datos.nombre;
                document.getElementById('preview-line').textContent = datos.linea_investigacion;
                document.getElementById('preview-uni').textContent = datos.universidad;
            } else {
                const errorData = await res.json();
                alert("❌ Error: " + (errorData.error || "No se pudo actualizar"));
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("❌ Hubo un error de conexión.");
        }
    }});