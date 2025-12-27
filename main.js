document.addEventListener('DOMContentLoaded', () => {
    const langEsBtn = document.getElementById('lang-es');
    const langEnBtn = document.getElementById('lang-en');
    let currentLang = 'es';
    let data = {};

    // Cargar datos y renderizar
    async function loadDataAndRender() {
        try {
            const response = await fetch('data.json');
            data = await response.json();
            renderContent(currentLang, false); // No animar en la carga inicial
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    }

    // Renderizar contenido según el idioma
    function renderContent(lang, animate = true) {
        const heroEs = document.getElementById('hero-text-es');
        const heroEn = document.getElementById('hero-text-en');

        if (lang === 'es') {
            heroEs.classList.remove('hidden');
            heroEn.classList.add('hidden');
        } else {
            heroEn.classList.remove('hidden');
            heroEs.classList.add('hidden');
        }

        // Mostrar/ocultar etiquetas estáticas de botones (label-es / label-en)
        document.querySelectorAll('.label-es').forEach(el => {
            if (lang === 'es') {
                el.classList.remove('hidden');
                // optional glitch
                if (animate) {
                    el.classList.add('glitch');
                    el.addEventListener('animationend', () => el.classList.remove('glitch'), { once: true });
                }
            } else {
                el.classList.add('hidden');
            }
        });
        document.querySelectorAll('.label-en').forEach(el => {
            if (lang === 'en') {
                el.classList.remove('hidden');
                if (animate) {
                    el.classList.add('glitch');
                    el.addEventListener('animationend', () => el.classList.remove('glitch'), { once: true });
                }
            } else {
                el.classList.add('hidden');
            }
        });

        // Animar textos del hero
        if (animate) {
            const heroElements = lang === 'es' ? heroEs.children : heroEn.children;
            for (const el of heroElements) {
                el.classList.add('glitch');
                el.addEventListener('animationend', () => el.classList.remove('glitch'), { once: true });
            }
        }

        // Actualizar textos dinámicos (otros elementos que usan data-key)
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (data[lang] && data[lang][key]) {
                if (animate) {
                    element.classList.add('glitch');
                    element.addEventListener('animationend', () => element.classList.remove('glitch'), { once: true });
                }
                element.textContent = data[lang][key];
            }
        });

        // Información Personal
        const personalInfoContent = document.getElementById('personal-info-content');
        if (data[lang] && data[lang].personal_info) {
            personalInfoContent.innerHTML = `<p>${data[lang].personal_info.bio}</p>`;
        }

        // Experiencia Profesional
        const experienceContent = document.getElementById('experience-content');
        if (data[lang] && data[lang].experience) {
            experienceContent.innerHTML = data[lang].experience.map(item => `
                <div class="mb-6 bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold">${item.position}</h3>
                    <p class="text-gray-600">${item.company} | ${item.period}</p>
                    <p class="mt-2">${item.description}</p>
                </div>
            `).join('');
        }

        // Proyectos Personales
        const projectsContent = document.getElementById('projects-content');
        if (data[lang] && data[lang].projects) {
            projectsContent.innerHTML = data[lang].projects.map(project => `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold">${project.title}</h3>
                    <p class="mt-2">${project.description}</p>
                    <a href="${project.link}" class="text-blue-500 hover:underline mt-4 inline-block">Ver proyecto</a>
                </div>
            `).join('');
        }

        // CV Links
        const downloadCvEs = document.getElementById('download-cv-es');
        const downloadCvEn = document.getElementById('download-cv-en');
        if (data.cv_links) {
            downloadCvEs.href = data.cv_links.es;
            downloadCvEn.href = data.cv_links.en;
        }
        
        // Actualizar botones de idioma
        updateLangButtons(lang);
    }

    function updateLangButtons(lang) {
        if (lang === 'es') {
            langEsBtn.classList.add('selected');
            langEnBtn.classList.remove('selected');
        } else {
            langEnBtn.classList.add('selected');
            langEsBtn.classList.remove('selected');
        }
    }

    // Cambiar idioma
    langEsBtn.addEventListener('click', () => {
        if (currentLang !== 'es') {
            currentLang = 'es';
            renderContent(currentLang);
        }
    });

    langEnBtn.addEventListener('click', () => {
        if (currentLang !== 'en') {
            currentLang = 'en';
            renderContent(currentLang);
        }
    });

    // Formulario de contacto
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        
        // Reemplaza con tu endpoint de Formspree
        const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID'; 

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert('¡Gracias por tu mensaje!');
                contactForm.reset();
            } else {
                alert('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error en el formulario de contacto:', error);
            alert('Hubo un error al enviar el mensaje. Inténtalo de nuevo.');
        }
    });

    // Carga inicial
    loadDataAndRender();
});

