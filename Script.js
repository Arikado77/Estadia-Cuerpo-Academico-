// === 1. MANEJO DEL MENÚ (CON PROTECCIÓN) ===
const menuBtn = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("show");
    });
}

// === 2. EFECTO DE APARICIÓN (INTERSECTION OBSERVER) ===
const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: 0.2 });

sections.forEach(section => observer.observe(section));

// === 3. FUNCIÓN DE PESTAÑAS (TABS) ===
function openTab(evt, tabId) {
    var i, tabContent, tabButtons;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(tabId).style.display = "block";
    evt.currentTarget.className += " active";
}

// === 4. LÓGICA DE PERFILES DE MIEMBROS (LA QUE FALTABA) ===
document.addEventListener('DOMContentLoaded', () => {
    // Buscamos todos los enlaces de nombres en las tarjetas
    const memberLinks = document.querySelectorAll('.member-name-link');

    memberLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el <a> haga scroll arriba
            
            // Buscamos el div de detalles que está justo después del link (o dentro del padre)
            const card = link.closest('.member-card');
            const details = card.querySelector('.member-details');

            if (details) {
                // Verificamos si ya está abierto
                const isVisible = details.style.display === 'block';

                // OPCIONAL: Cerrar otros detalles antes de abrir este
                document.querySelectorAll('.member-details').forEach(d => {
                    d.style.display = 'none';
                });

                // Si estaba oculto, lo mostramos
                if (!isVisible) {
                    details.style.display = 'block';
                } else {
                    details.style.display = 'none';
                }
            }
        });
    });
});