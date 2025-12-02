/*const userLoggedIn = localStorage.getItem('userLoggedIn');
if (userLoggedIn !== 'true') {
    window.location.href = 'login.html';
}



document.addEventListener('DOMContentLoaded', () => {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const profilePic = document.getElementById('profile-pic');
    
    // Asigna la imagen de perfil guardada, o usa una por defecto
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        profilePic.src = savedAvatar;
    } else {
        profilePic.src = 'https://via.placeholder.com/150'; // Imagen por defecto
    }

    if (userLoggedIn === 'true') {
        document.getElementById('user-name').textContent = userEmail.split('@')[0];
        document.getElementById('user-status').textContent = `Estado: ${userRole === 'admin' ? 'Administrador' : 'Usuario Común'}`;

        if (userRole === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
        }

        // Lógica para el cambio de foto de perfil
        const changePicBtn = document.getElementById('change-pic-btn');
        const photoOptionsContainer = document.getElementById('photo-options');
        const avatarOptions = document.querySelectorAll('.avatar-option');

        changePicBtn.addEventListener('click', () => {
            photoOptionsContainer.style.display = photoOptionsContainer.style.display === 'block' ? 'none' : 'block';
        });

        avatarOptions.forEach(avatar => {
            avatar.addEventListener('click', () => {
                // Remueve la clase 'selected' de todas las imágenes
                avatarOptions.forEach(img => img.classList.remove('selected'));
                
                // Agrega la clase 'selected' a la imagen actual
                avatar.classList.add('selected');

                // Guarda la URL de la imagen en localStorage
                const newAvatarSrc = avatar.src;
                localStorage.setItem('userAvatar', newAvatarSrc);
                
                // Actualiza la imagen de perfil en la página
                profilePic.src = newAvatarSrc;
            });
        });

    } else {
        window.location.href = 'login.html';
    }
});*/
    
    document.addEventListener('DOMContentLoaded', () => {
        
        // --- 1. Lógica para Cerrar Sesión (Logout) ---
        const logoutButton = document.querySelector('.action-btn-secondary i.bx-log-out').closest('button');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                // Borra los datos de la sesión almacenados
                localStorage.clear();
                // Redirige al usuario a la página principal o de login
                window.location.href = 'login.html'; // Ajusta a tu página de login/inicio
            });
        }

        // --- 2. Simulación de Carga de Datos de Usuario ---
        // Estos datos deberían venir de una API real, pero los usamos para poblar el formulario
        const userData = {
            fullName: "Carlos Pérez",
            email: "carlos.ejemplo@ut.edu",
            role: "Estudiante Colaborador",
            affiliation: "Ingeniería de Software",
            bio: "Breve resumen de mi experiencia académica y profesional.",
            // Datos del registro
            university: "Universidad Tecnológica de Chihuahua (UTCH)",
            cityState: "Chihuahua, Chihuahua",
            researchLine: "Desarrollo Web y Apps Móviles",
            googleProfile: "https://scholar.google.com/carlos",
            orcid: "0000-1234-5678-9012"
        };
        
        // Cargar datos en los elementos de visualización (columna izquierda)
        document.getElementById('user-role').textContent = userData.role;
        document.getElementById('user-email').textContent = userData.email;

        // Cargar datos en el formulario de edición (columna derecha)
        document.getElementById('full-name').value = userData.fullName;
        document.getElementById('affiliation').value = userData.affiliation; // Este campo lo adaptamos
        document.getElementById('bio').value = userData.bio;
        
        // Campos extraídos de tu registro (usando el código del mensaje anterior)
        document.getElementById('university').value = userData.university;
        document.getElementById('city-state').value = userData.cityState;
        document.getElementById('research-line').value = userData.researchLine;
        document.getElementById('google-profile').value = userData.googleProfile;
        document.getElementById('orcid').value = userData.orcid;


        // --- 3. Lógica para Cambiar Foto de Perfil (Aleatoria) ---
        const photo = document.querySelector('.profile-photo');
        const uploadButton = document.querySelector('.upload-btn');
        const defaultPhotoUrl = photo.src; // Guarda la ruta por defecto
        
        // Array de URLs de imágenes aleatorias (sustituye esto por un servicio real)
        const randomImageUrls = [
            'https://picsum.photos/id/1027/200/200',
            'https://picsum.photos/id/1025/200/200',
            'https://picsum.photos/id/1011/200/200',
            'https://picsum.photos/id/1012/200/200'
        ];

        if (uploadButton) {
            uploadButton.addEventListener('click', () => {
                // Simulación: selecciona una URL aleatoria
                const randomIndex = Math.floor(Math.random() * randomImageUrls.length);
                const newPhotoUrl = randomImageUrls[randomIndex];
                
                // Aplica la nueva imagen
                photo.src = newPhotoUrl;
                alert('¡Foto de perfil actualizada a una imagen aleatoria! En la versión final, se abriría el selector de archivos.');
            });
        }

        // --- 4. Lógica para Guardar Cambios (Simulación) ---
        const form = document.querySelector('.editable-data-card form');
        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault(); // Evita que la página se recargue

                // En un entorno real, aquí se recolectarían todos los datos del formulario:
                // const newFullName = document.getElementById('full-name').value;
                // ... y se enviarían a una API (fetch)
                
                alert('¡Datos de perfil actualizados con éxito! (Simulación)');
            });
        }
    });
