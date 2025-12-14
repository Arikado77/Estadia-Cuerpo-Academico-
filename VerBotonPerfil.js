document.addEventListener('DOMContentLoaded', () => {
                const authLinkContainer = document.getElementById('auth-link');
                const adminPanel = document.getElementById('admin-panel'); 
                
                // --- FUNCIÓN PARA CREAR EL MENÚ DE PERFIL (Misma lógica que en index.html) ---
                const createProfileDropdown = (userEmail) => {
                    
                    const profileDropdown = document.createElement('div');
                    profileDropdown.className = 'profile-dropdown';
                    
                    const profileButton = document.createElement('button');
                    profileButton.className = 'profile-button';
                    const userName = userEmail ? userEmail.split('@')[0] : 'Usuario';
                    profileButton.textContent = `Hola, ${userName} ▼`; // Flecha hacia abajo
                    
                    const dropdownContent = document.createElement('div');
                    dropdownContent.className = 'dropdown-content';
                    
                    const viewProfileLink = document.createElement('a');
                    viewProfileLink.href = 'Perfil.html';
                    viewProfileLink.textContent = 'Ver Perfil';
                    
                    // Enlace de Cerrar Sesión (con estilo CSS y lógica fetch)
                    const logoutLink = document.createElement('a');
                    logoutLink.href = '#'; 
                    logoutLink.textContent = 'Cerrar Sesión';
                    logoutLink.className = 'logout-link-style'; 
                    
                    logoutLink.addEventListener('click', async (event) => {
                        event.preventDefault(); 
                        try {
                            await fetch('/api/logout', { method: 'POST' });
                            window.location.reload(); 
                        } catch (error) {
                            console.error('Fallo al cerrar sesión:', error);
                            alert('Fallo al contactar al servidor para cerrar sesión.');
                        }
                    });
                    
                    // Ensamblar el menú
                    dropdownContent.appendChild(viewProfileLink);
                    dropdownContent.appendChild(logoutLink);
                    profileDropdown.appendChild(profileButton);
                    profileDropdown.appendChild(dropdownContent);

                    authLinkContainer.innerHTML = '';
                    authLinkContainer.appendChild(profileDropdown);

                    // Lógica para mostrar/ocultar el dropdown
                    profileButton.addEventListener('click', () => {
                        dropdownContent.classList.toggle('show-dropdown');
                    });

                    // Cerrar el dropdown al hacer clic fuera
                    window.onclick = function(event) {
                        if (!event.target.matches('.profile-button')) {
                            const dropdowns = document.getElementsByClassName('dropdown-content');
                            for (let i = 0; i < dropdowns.length; i++) {
                                const openDropdown = dropdowns[i];
                                if (openDropdown.classList.contains('show-dropdown')) {
                                    openDropdown.classList.remove('show-dropdown');
                                }
                            }
                        }
                    };
                };

                // 1. CONSULTAR AL SERVIDOR EL ESTADO DE AUTENTICACIÓN Y ROL
                // Esta es la única fuente de verdad para el estado de la UI
                
                // Aseguramos que el adminPanel esté oculto por defecto
                if (adminPanel) {
                    adminPanel.style.display = 'none';
                }

                fetch('/api/status')
                    .then(res => {
                        // Manejamos errores de red o del servidor
                        if (!res.ok) throw new Error('Fallo en la conexión al servidor de estado.');
                        return res.json();
                    })
                    .then(data => {
                        if (data.isAuthenticated) {
                            // 2. Si está autenticado, creamos el menú de perfil
                            createProfileDropdown(data.userEmail);
                            
                            // 3. LÓGICA DE ROL: Mostrar/Ocultar el panel de administración
                            if (data.rol === 'administrador') {
                                if (adminPanel) {
                                    adminPanel.style.display = 'block'; 
                                }
                            } 
                            // Si es solo 'usuario' o el rol no es 'administrador', se queda oculto.
                            
                        } else {
                            // Si NO está autenticado, la UI se queda con el botón de Iniciar Sesión por defecto
                            // Y EL MIDDLEWARE DE EXPRESS TE REDIRIGIRÁ A LOGIN ANTES DE VER ESTE CONTENIDO.
                            if (authLinkContainer) {
                                authLinkContainer.innerHTML = '<a href="login.html" class="login-button">Iniciar Sesión</a>';
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Fallo al verificar la sesión:', error);
                        // Si falla la conexión, la UI debe mostrar el estado por defecto
                    });
            });