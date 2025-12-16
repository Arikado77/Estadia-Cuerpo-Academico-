const menuBtn = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
  nav.classList.toggle("show");
});

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.2 });

function openTab(evt, tabId) {
        // Declara variables
        var i, tabContent, tabButtons;

        // Oculta todos los contenidos de las pestañas
        tabContent = document.getElementsByClassName("tab-content");
        for (i = 0; i < tabContent.length; i++) {
            tabContent[i].style.display = "none";
        }

        // Desactiva la clase 'active' de todos los botones
        tabButtons = document.getElementsByClassName("tab-button");
        for (i = 0; i < tabButtons.length; i++) {
            tabButtons[i].className = tabButtons[i].className.replace(" active", "");
        }

        // Muestra el contenido de la pestaña actual, y añade una clase "active" al botón
        document.getElementById(tabId).style.display = "block";
        evt.currentTarget.className += " active";
    }