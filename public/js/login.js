document.addEventListener('DOMContentLoaded', () => {
    
    // === 1. LÓGICA DE REGISTRO ===
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datosRegistro = {
                nombre: document.getElementById('nombre').value, 
                email: document.getElementById('reg-email').value, 
                universidad: document.getElementById('universidad').value,
                ciudad_estado: document.getElementById('ciudad_estado').value,
                linea_investigacion: document.getElementById('linea_investigacion').value,
                perfil_google_url: document.getElementById('perfil_google_url').value,
                orcid_id: document.getElementById('orcid_id').value,
                contrasena_hash: document.getElementById('reg-password').value 
            };
            
            const confirmarContrasena = document.getElementById('confirm-password').value; 
            
            if (datosRegistro.contrasena_hash !== confirmarContrasena) { 
                alert('Las contraseñas no coinciden.');
                return;
            }

            try {
                const respuesta = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosRegistro),
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
                    // Forzamos el cambio al formulario de login (si usas el diseño de toggle)
                    location.reload(); 
                } else {
                    alert(`❌ Error al registrar: ${data.error || 'Fallo desconocido.'}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Fallo de conexión con el servidor.');
            }
        });
    }


    // === 2. LÓGICA DE INICIO DE SESIÓN (LOGIN) ===
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datosLogin = {
                email: document.getElementById('email').value,
                contrasena: document.getElementById('password').value 
            };
            
            if (!datosLogin.email || !datosLogin.contrasena) {
                alert('Por favor, ingresa tu correo electrónico y contraseña.');
                return;
            }

            try {
                const respuesta = await fetch('/api/login', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosLogin),
                });

                const data = await respuesta.json();

                if (respuesta.ok) {
                    // LA MAGIA: Si el servidor manda una ruta de redirección, la seguimos.
                    // Si no, por defecto vamos al index.html
                    window.location.href = data.redirect || '/index.html'; 
                } else {
                    alert(`❌ Error: ${data.error || 'Credenciales inválidas.'}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Fallo de conexión.');
            }
        });
    }

    // === 3. LÓGICA DE "OLVIDÉ MI CONTRASEÑA" ===
    // Asegúrate de que en tu HTML el enlace tenga el id="forgot-password"
    const forgotBtn = document.getElementById('forgot-password');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const email = prompt("📧 Ingresa tu correo electrónico registrado para enviarte un enlace de recuperación:");
            
            if (!email) return;

            try {
                const res = await fetch('/api/auth/olvide-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const data = await res.json();
                
                if (data.success) {
                    alert("📩 " + data.mensaje);
                } else {
                    alert("❌ " + (data.error || "No se pudo procesar la solicitud."));
                }
            } catch (error) {
                alert("Error de conexión al intentar recuperar contraseña.");
            }
        });
    }
});