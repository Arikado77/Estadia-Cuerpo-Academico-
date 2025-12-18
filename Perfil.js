document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('avatar-grid');
    const sectionAvatars = document.getElementById('section-avatars');
    const btnToggle = document.getElementById('btn-toggle-avatars');
    let selectedAvatar = '';

    // 1. CARGAR DATOS DEL PERFIL
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

                // Llenar el resto de tus inputs (TUS DATOS)
                document.getElementById('university').value = user.universidad || '';
                document.getElementById('city-state').value = user.ciudad_estado || '';
                document.getElementById('research-line').value = user.linea_investigacion || '';
                document.getElementById('google-profile').value = user.perfil_google_url || '';
                document.getElementById('orcid').value = user.orcid_id || '';
                
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

    // 2. MOSTRAR / OCULTAR MONITOS
    btnToggle.onclick = () => {
        if (sectionAvatars.style.display === 'none') {
            sectionAvatars.style.display = 'block';
            btnToggle.innerHTML = "<i class='bx bx-x'></i> Cancelar";
        } else {
            sectionAvatars.style.display = 'none';
            btnToggle.innerHTML = "<i class='bx bx-refresh'></i> Cambiar Foto";
        }
    };

    // 3. CREAR LOS MONITOS (Asegurando .jpg)
    for (let i = 1; i <= 10; i++) {
        const img = document.createElement('img');
        img.src = `/img/avatars/${i}.jpg`; // CORRECCIÓN .JPG
        img.className = 'avatar-item';
        
        // Si falla el JPG, intentar PNG por si acaso
        img.onerror = function() {
            if (!this.src.endsWith('.jpg')) {
                this.src = `/img/avatars/${i}.jpg`;
            }
        };

        img.onclick = () => {
            document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
            selectedAvatar = img.src;
        };
        grid.appendChild(img);
    }

    // 4. GUARDAR MONITO
    document.getElementById('save-avatar-btn').onclick = async () => {
        if (!selectedAvatar) return alert("Selecciona un monito primero");

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
        }
    };

    // 5. TU FORMULARIO DE ACTUALIZAR DATOS (INTACTO)
    document.getElementById('perfil-form').onsubmit = async (e) => {
        e.preventDefault();
        const datos = {
            nombre: document.getElementById('full-name').value,
            universidad: document.getElementById('university').value,
            ciudad_estado: document.getElementById('city-state').value,
            linea_investigacion: document.getElementById('research-line').value,
            perfil_google_url: document.getElementById('google-profile').value,
            orcid_id: document.getElementById('orcid').value
        };

        const res = await fetch('/api/usuario/actualizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("✅ Información actualizada");
            document.getElementById('user-name-title').textContent = datos.nombre;
            document.getElementById('preview-line').textContent = datos.linea_investigacion;
            document.getElementById('preview-uni').textContent = datos.universidad;
        }
    };

    // 6. LOGOUT
    document.getElementById('logout-btn').onclick = async () => {
        if (confirm("¿Cerrar sesión?")) {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = 'login.html';
        }
    };
});