// auth.js (o el archivo JS que uses para la lógica de usuario)
// ESTE CÓDIGO SE EJECUTA EN EL NAVEGADOR

document.addEventListener('DOMContentLoaded', () => {
    
    // === 1. LÓGICA DE REGISTRO ===
    const registroForm = document.getElementById('registroForm');
    
    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detiene el envío normal del formulario

            // 1. Obtener todos los datos del formulario de registro
            const datosRegistro = {
                // Asumiendo que has corregido el HTML para que todos estos IDs existan
                nombre: document.getElementById('nombre').value, 
                email: document.getElementById('reg-email').value, // <-- Usamos el ID original
                universidad: document.getElementById('universidad').value,
                ciudad_estado: document.getElementById('ciudad_estado').value,
                linea_investigacion: document.getElementById('linea_investigacion').value,
                perfil_google_url: document.getElementById('perfil_google_url').value,
                orcid_id: document.getElementById('orcid_id').value,
                
                // ¡CORRECCIÓN CRÍTICA DE SINCRONIZACIÓN! 
                // Enviamos la llave que el servidor Node.js espera para el hashing
                contrasena_hash: document.getElementById('reg-password').value // <-- Usamos el ID original
            };
            
            // 2. Validación: verificar que las contraseñas coincidan
            // Usamos el ID original: id="confirm-password"
            const confirmarContrasena = document.getElementById('confirm-password').value; 
            
            // Validamos contra el campo que acabamos de leer
            if (datosRegistro.contrasena_hash !== confirmarContrasena) { 
                alert('Las contraseñas no coinciden.');
                return;
            }

            // 3. Enviar los datos al servidor (Ruta: /api/registro)
            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosRegistro),
                });

                const data = await respuesta.json();

                if (respuesta.ok) { // Respuesta 200-299 (201 Created)
                    alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
                    window.location.href = '/login.html'; // Redirige a la página de login
                } else { // Respuestas 4xx, 5xx
                    alert(`❌ Error al registrar: ${data.error || 'Fallo desconocido.'}`);
                }

            } catch (error) {
                console.error('Error de red al registrar:', error);
                alert('Fallo de conexión con el servidor.');
            }
        });
    }


    // === 2. LÓGICA DE INICIO DE SESIÓN (LOGIN) ===
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Detiene el envío normal del formulario

            // 1. Obtener solo email y contraseña para el login
            const datosLogin = {
                // ASUMO que el login usa los IDs originales del formulario de Login
                email: document.getElementById('email').value,
                contrasena: document.getElementById('password').value // <-- ID del campo de contraseña del LOGIN
            };
            
            // 2. Validación básica
            if (!datosLogin.email || !datosLogin.contrasena) {
                alert('Por favor, ingresa tu correo electrónico y contraseña.');
                return;
            }

            // 3. Enviar los datos al servidor (Ruta: /api/login)
            try {
                const respuesta = await fetch('/api/login', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datosLogin),
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    alert('✅ ¡Inicio de sesión exitoso!');
                    // Redirige al index o al dashboard (debe coincidir con la ruta en server.js)
                    window.location.href = '/'; 
                } else {
                    alert(`❌ Error al iniciar sesión: ${data.error || 'Credenciales inválidas o fallo desconocido.'}`);
                }

            } catch (error) {
                console.error('Error de red al iniciar sesión:', error);
                alert('Fallo de conexión con el servidor.');
            }
        });
    }
});