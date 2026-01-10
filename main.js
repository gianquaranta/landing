document.addEventListener('DOMContentLoaded', () => {
    const langEsBtn = document.getElementById('lang-es');
    const langEnBtn = document.getElementById('lang-en');
    let currentLang = 'es';
    let data = {};
    let isLoading = false; // prevent concurrent loads
    const pageTitle = document.getElementById('page-title');
    const sectionBar = document.getElementById('section-bar');

    function pageTitleForLang(lang) {
        if (data && data.page_title) {
            return data.page_title[lang] || (lang === 'es' ? 'Gianfranco Quaranta - Web Personal' : 'Gianfranco Quaranta - Personal Web');
        }
        return lang === 'es' ? 'Gianfranco Quaranta - Web Personal' : 'Gianfranco Quaranta - Personal Web';
    }

    // Cargar datos y renderizar
    async function loadDataAndRender() {
        try {
            const dataUrl = window.DATA_URL || `data.json?v=${Date.now()}`;
            const response = await fetch(dataUrl, { cache: 'no-store' });
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const txt = await response.text();
                data = JSON.parse(txt);
            }
            
            // Apply default language
            if (data.default_language) {
                currentLang = data.default_language;
            }
            
            // Apply SEO metadata
            if (data.seo) {
                if (data.seo.title) document.title = data.seo.title;
                
                // Description meta tag
                let metaDesc = document.querySelector('meta[name="description"]');
                if (!metaDesc) {
                    metaDesc = document.createElement('meta');
                    metaDesc.name = 'description';
                    document.head.appendChild(metaDesc);
                }
                if (data.seo.description) metaDesc.content = data.seo.description;
                
                // Keywords meta tag
                let metaKeywords = document.querySelector('meta[name="keywords"]');
                if (!metaKeywords) {
                    metaKeywords = document.createElement('meta');
                    metaKeywords.name = 'keywords';
                    document.head.appendChild(metaKeywords);
                }
                if (data.seo.keywords) metaKeywords.content = data.seo.keywords;
            }
            
            // Apply favicon
            if (data.branding && data.branding.favicon) {
                let favicon = document.querySelector('link[rel="icon"]');
                if (!favicon) {
                    favicon = document.createElement('link');
                    favicon.rel = 'icon';
                    document.head.appendChild(favicon);
                }
                favicon.href = data.branding.favicon;
            }
            
            // Apply theme if specified in data.json (e.g., "handwritten")
            try {
                if (data && data.theme) {
                    document.body.classList.toggle(data.theme, true);
                    // expose applied theme for debugging
                    document.body.setAttribute('data-theme', data.theme);
                    console.log('Applied theme from data.json:', data.theme);
                }
                // Apply default theme colors from data.json if provided
                try {
                    const themeColors = (data.theme_colors) || (data.branding && data.branding.colors) || null;
                    if (themeColors) applyThemeColors(themeColors);
                } catch (e) { console.warn('Theme colors not applied:', e); }
            } catch (err) { console.error(err); }
            renderContent(currentLang, false); // No animar en la carga inicial
            // Ensure contact links are initialized on initial load too
            renderContactLinks();
            renderPersonalContactLinks();
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    }

    // --- Theme Colors Helpers ---
    function hexToRgb(hex) {
        if (!hex) return null;
        let c = hex.trim();
        if (c.startsWith('#')) c = c.slice(1);
        if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
        if (c.length !== 6) return null;
        const num = parseInt(c, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return { r, g, b };
    }
    function rgbaFromHex(hex, alpha) {
        const rgb = hexToRgb(hex);
        if (!rgb) return null;
        return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
    }
    function setVar(name, value) {
        if (value == null) return;
        document.documentElement.style.setProperty(name, value);
    }
    function applyThemeColors(cfg) {
        // Gradient background
        if (cfg.gradient) {
            setVar('--bg-top', cfg.gradient.top || null);
            setVar('--bg-mid', cfg.gradient.mid || null);
            setVar('--bg-bottom', cfg.gradient.bottom || null);
        }

        // Primary palette to derive blobs/highlights if explicit values not provided
        const primary = cfg.primary || '#0C8296';
        const secondary = cfg.secondary || cfg.primary || '#0C5F87';
        const accent = cfg.accent || cfg.primary || '#1296A0';
        const soft = cfg.soft || secondary || '#3C9696';

        // Blob colors (allow explicit overrides or derive from palette)
        setVar('--blob1', cfg.blob1 || rgbaFromHex(primary, 0.92));
        setVar('--blob2', cfg.blob2 || rgbaFromHex(secondary, 0.84));
        setVar('--blob3', cfg.blob3 || rgbaFromHex(accent, 0.82));
        setVar('--blob4', cfg.blob4 || rgbaFromHex(soft, 0.58));

        // Highlights (explicit or derived from accent)
        setVar('--highlight1', cfg.highlight1 || rgbaFromHex(accent, 0.09));
        setVar('--highlight2', cfg.highlight2 || rgbaFromHex(accent, 0.06));

        // Text/link/labels
        setVar('--text-main', cfg.text || null);
        setVar('--link-color', cfg.link || null);
        setVar('--label-color', cfg.label || null);
        setVar('--underline-color', cfg.underline || cfg.link || null);

        // Modal and card backgrounds (optional)
        setVar('--modal-bg', cfg.modal_bg || null);
        setVar('--card-bg', cfg.card_bg || null);
        setVar('--toast-bg', cfg.toast_bg || null);
    }

    // Renderizar contenido según el idioma
    // `animate` controla si se aplica el efecto "glitch"; por defecto false.
    function renderContent(lang, animate = false) {
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

        // Información Personal (bio + education + skills)
        const personalInfoContent = document.getElementById('personal-info-content');
        if (personalInfoContent && data[lang] && data[lang].personal_info) {
            const bio = data[lang].personal_info.bio || '';
            // Education
            let educationHtml = '';
            if (data[lang].education) {
                const ed = data[lang].education;
                educationHtml = `
                    <div class="mb-6 bg-white p-6 rounded-lg shadow-md">
                        <h3 class="text-xl font-bold">${data[lang].education_title || ''}</h3>
                        <p class="mt-2 font-semibold">${ed.degree || ''}</p>
                        <p class="text-gray-600">${ed.status || ''}</p>
                        ${ed.gpa ? `<p class="mt-2 text-sm text-gray-700">${ed.gpa}</p>` : ''}
                    </div>
                `;
            }

            // Skills (soft + hard) -> dos cards con títulos y chips planos desde data.json
            let skillsHtml = '';
            if (data[lang]) {
                const sk = data[lang].skills || {};
                const softItems = Array.isArray(data[lang].soft_skills) ? data[lang].soft_skills : (Array.isArray(sk.soft) ? sk.soft : []);
                const hardItems = Array.isArray(data[lang].hard_skills) ? data[lang].hard_skills : (Array.isArray(sk.hard) ? sk.hard : []);
                const softTitle = data[lang].soft_skills_title || sk.soft_title || '';
                const hardTitle = data[lang].hard_skills_title || sk.hard_title || '';
                const softChips = softItems.map(s => `<span class=\"skill-chip\">${s}</span>`).join('');
                const hardChips = hardItems.map(s => `<span class=\"skill-chip\">${s}</span>`).join('');

                skillsHtml = `
                    <div class=\"skills-two-col\">
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h4 class=\"font-semibold\">${softTitle}</h4>
                            <div class=\"chip-list mt-2\">${softChips}</div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <h4 class=\"font-semibold\">${hardTitle}</h4>
                            <div class=\"chip-list mt-2\">${hardChips}</div>
                        </div>
                    </div>
                `;
            }

            personalInfoContent.innerHTML = `
                <div class="mb-4">
                    <p>${bio}</p>
                </div>
                ${educationHtml}
                ${skillsHtml}
            `;

            if (animate) {
                personalInfoContent.classList.add('glitch');
                personalInfoContent.addEventListener('animationend', () => personalInfoContent.classList.remove('glitch'), { once: true });
            }
        }

        // Experiencia Profesional
        const experienceContent = document.getElementById('experience-content');
        if (experienceContent && data[lang] && data[lang].experience) {
            experienceContent.innerHTML = data[lang].experience.map(item => `
                <div class="mb-6 bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold">${item.position}</h3>
                    <p class="text-gray-600">${item.company} | ${item.period}</p>
                    <p class="mt-2">${item.description}</p>
                </div>
            `).join('');
            if (animate) {
                experienceContent.classList.add('glitch');
                experienceContent.addEventListener('animationend', () => experienceContent.classList.remove('glitch'), { once: true });
            }
        }

        // Proyectos Personales - flexible grid (1-3 items per row)
        const projectsContent = document.getElementById('projects-content');
        if (projectsContent && data[lang] && data[lang].projects) {
            const projects = data[lang].projects;
            const count = projects.length;
            const cols = Math.min(count, 3); // max 3 columns
            
            // Remove Tailwind grid classes that limit width
            projectsContent.className = '';
            
            // Helper: tech to SVG file path mapping (brand icons)
            const techIconPath = {
                react: 'react.svg',
                spring: 'spring.svg',
                firebase: 'firebase.svg',
                gcp: 'gcp.svg',
                vercel: 'vercel.svg',
                supabase: 'supabase.svg',
                nextjs: 'next.svg'
            };
            const renderTechRow = (project) => {
                const tech = project.tech && Array.isArray(project.tech) ? project.tech : [];
                if (!tech.length) return '';
                const chips = tech
                    .map(name => {
                        const key = String(name || '').toLowerCase();
                        const path = techIconPath[key];
                        if (!path) return '';
                        const icon = `<img src="${path}" alt="${name} icon" class="tech-icon-img" aria-hidden="true">`;
                        const label = String(name).toUpperCase();
                        return `<span class="tech-chip">${icon}<span class="tech-label">${label}</span></span>`;
                    })
                    .filter(Boolean)
                    .join('');
                return `<div class="tech-row">${chips}</div>`;
            };

            const cardsHtml = projects.map(project => `
                <div class="project-card bg-white p-6 rounded-lg shadow-md">
                    ${project.image ? `<div class="w-full mb-4 rounded-md overflow-hidden" style="aspect-ratio: 16/9;"><img src="${project.image}" alt="${project.title}" class="w-full h-full object-cover"></div>` : ''}
                    <h3 class="text-xl font-bold">${project.title}</h3>
                    ${renderTechRow(project)}
                    <p class="mt-2">${project.description}</p>
                    <a href="${project.link}" class="project-link text-blue-500 hover:underline mt-4 inline-block">${data[lang].projects_cta || (lang === 'es' ? 'Ver proyecto' : 'View project')}</a>
                </div>
            `).join('');

            projectsContent.innerHTML = cardsHtml;

            // Apply grid layout directly to projects-content container
            projectsContent.style.display = 'grid';
            projectsContent.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            projectsContent.style.gap = '1.5rem';
            projectsContent.style.width = '100%';
            projectsContent.style.boxSizing = 'border-box';

            if (animate) {
                projectsContent.classList.add('glitch');
                projectsContent.addEventListener('animationend', () => projectsContent.classList.remove('glitch'), { once: true });
            }
        }

        // Update contact links
        updateContactLinks();

        // CV Links
        const downloadCvEs = document.getElementById('download-cv-es');
        const downloadCvEn = document.getElementById('download-cv-en');
        if (data.cv_links) {
            if (downloadCvEs) downloadCvEs.href = data.cv_links.es;
            if (downloadCvEn) downloadCvEn.href = data.cv_links.en;
        }
        
        // Actualizar botones de idioma
        updateLangButtons(lang);

        // Hero photo: set image from data.json (top-level or per-language key)
        try {
            const heroPhotoEl = document.getElementById('hero-photo');
            const photoFile = (data && (data.hero_photo || (data[lang] && data[lang].hero_photo))) || '';
            if (heroPhotoEl) {
                if (photoFile) {
                    heroPhotoEl.src = photoFile;
                    heroPhotoEl.classList.remove('hidden');
                } else {
                    heroPhotoEl.src = '';
                    heroPhotoEl.classList.add('hidden');
                }
            }
        } catch (e) { /* ignore */ }

        // Mostrar/ocultar título en la cabecera cuando la página está colapsada
        if (pageTitle) {
            if (document.body.classList.contains('collapsed')) {
                pageTitle.textContent = pageTitleForLang(lang);
                pageTitle.classList.remove('hidden');
            } else {
                pageTitle.classList.add('hidden');
            }
        }
    }

    // (Sin agrupación ni cálculo de categorías: los chips se leen y muestran tal cual del data.json)

    function updateLangButtons(lang) {
        if (lang === 'es') {
            langEsBtn.classList.add('selected');
            langEnBtn.classList.remove('selected');
        } else {
            langEnBtn.classList.add('selected');
            langEsBtn.classList.remove('selected');
        }
    }

    // Update contact info links (call after partial loads)
    function updateContactLinks() {
        if (!data.contact_info) return;
        
        // Contact section links
        const emailLink = document.getElementById('contact-email');
        const linkedinLink = document.getElementById('contact-linkedin');
        const githubLink = document.getElementById('contact-github');
        
        if (emailLink && data.contact_info.email) {
            emailLink.onclick = (e) => {
                e.preventDefault();
                window.location.href = `mailto:${data.contact_info.email}`;
            };
        }
        if (linkedinLink && data.contact_info.linkedin) {
            linkedinLink.onclick = (e) => {
                e.preventDefault();
                window.open(data.contact_info.linkedin, '_blank', 'noopener,noreferrer');
            };
        }
        if (githubLink && data.contact_info.github) {
            githubLink.onclick = (e) => {
                e.preventDefault();
                window.open(data.contact_info.github, '_blank', 'noopener,noreferrer');
            };
        }
        
        // Personal info section links
        const personalEmailLink = document.getElementById('personal-contact-email');
        const personalLinkedinLink = document.getElementById('personal-contact-linkedin');
        const personalGithubLink = document.getElementById('personal-contact-github');
        
        if (personalEmailLink) {
            personalEmailLink.onclick = (e) => {
                e.preventDefault();
                // Open contact form partial instead of mailto
                collapseAndShow('#contacto');
            };
        }
        if (personalLinkedinLink && data.contact_info.linkedin) {
            personalLinkedinLink.onclick = (e) => {
                e.preventDefault();
                window.open(data.contact_info.linkedin, '_blank', 'noopener,noreferrer');
            };
        }
        if (personalGithubLink && data.contact_info.github) {
            personalGithubLink.onclick = (e) => {
                e.preventDefault();
                window.open(data.contact_info.github, '_blank', 'noopener,noreferrer');
            };
        }
        // Hero social: set external hrefs so default behavior opens in new tab
        const heroLinkedin = document.getElementById('hero-linkedin');
        const heroGithub = document.getElementById('hero-github');
        if (heroLinkedin && data.contact_info.linkedin) {
            heroLinkedin.setAttribute('href', data.contact_info.linkedin);
        }
        if (heroGithub && data.contact_info.github) {
            heroGithub.setAttribute('href', data.contact_info.github);
        }
    }

        // Build contact links markup directly from data.json (robust vs empty hrefs)
        function renderContactLinks() {
                const info = data.contact_info;
                if (!info) return;
                const container = document.getElementById('contact-links');
                if (container) {
                        container.innerHTML = `
                                <a id="contact-email" href="mailto:${info.email}" class="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                    </svg>
                                    <span class="text-sm font-medium">Email</span>
                                </a>
                                <a id="contact-linkedin" href="${info.linkedin}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    <span class="text-sm font-medium">LinkedIn</span>
                                </a>
                                <a id="contact-github" href="${info.github}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    <span class="text-sm font-medium">GitHub</span>
                                </a>
                        `;
                }
        }

        function renderPersonalContactLinks() {
                const info = data.contact_info;
                if (!info) return;
                const container = document.getElementById('personal-contact-links');
                if (container) {
                        container.innerHTML = `
                                <a id="personal-contact-email" href="mailto:${info.email}" class="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                    </svg>
                                    <span class="text-sm font-medium">Email</span>
                                </a>
                                <a id="personal-contact-linkedin" href="${info.linkedin}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    <span class="text-sm font-medium">LinkedIn</span>
                                </a>
                                <a id="personal-contact-github" href="${info.github}" target="_blank" rel="noopener noreferrer" class="flex flex-col items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
                                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    <span class="text-sm font-medium">GitHub</span>
                                </a>
                        `;
                }
        }

    // Attach submit handler to a contact form element (safe: checks element)
    function attachContactFormHandler(formElement) {
        if (!formElement) return;
        if (formElement.dataset.handlerAttached === 'true') return;
        formElement.dataset.handlerAttached = 'true';
        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formElement);
            const formspreeEndpoint = 'https://formspree.io/f/xlgennng';
            try {
                const response = await fetch(formspreeEndpoint, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
                if (response.ok) { showToast('¡Gracias por tu mensaje!', { type: 'info', duration: 3500 }); formElement.reset(); }
                else showToast('Hubo un error al enviar el mensaje. Inténtalo de nuevo.', { type: 'error', duration: 4500 });
            } catch (err) { console.error(err); showToast('Hubo un error al enviar el mensaje.', { type: 'error', duration: 4500 }); }
        });
    }

    // Loader utilities (inserts a small spinner into content-root)
    function showLoader(root) {
        if (!root) return;
        let loader = root.querySelector('.content-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'content-loader';
            loader.innerHTML = '<div class="spinner" aria-hidden="true"></div>';
            root.appendChild(loader);
        }
        root.classList.add('loading');
        loader.style.display = 'flex';
    }

    function hideLoader(root) {
        if (!root) return;
        const loader = root.querySelector('.content-loader');
        if (loader) loader.style.display = 'none';
        root.classList.remove('loading');
    }

    // Simple toast for user-facing messages
    function showToast(message, opts = { type: 'info', duration: 3500 }) {
        const toast = document.createElement('div');
        toast.className = `app-toast app-toast-${opts.type}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        document.body.appendChild(toast);
        // entry animation
        requestAnimationFrame(() => toast.classList.add('visible'));
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, opts.duration);
    }

    // Expand hero / return to inicio: reverse collapse
    function expandToInicio() {
        document.body.classList.remove('collapsed');
        if (pageTitle) {
            pageTitle.classList.add('hidden');
        }
        // section-bar visibility is controlled by CSS via body.collapsed
        // Hide any visible injected content-section and optionally clear it after animation
        const injected = document.querySelector('.content-section.visible');
        if (injected) {
            injected.classList.remove('visible');
            // small timeout to allow CSS transitions to finish before clearing
            setTimeout(() => {
                const contentRoot = document.getElementById('content-root');
                if (contentRoot) {
                    // remove visible class to fade out overlay
                    contentRoot.classList.remove('visible-overlay');
                }
                setTimeout(() => {
                    if (contentRoot) {
                        contentRoot.innerHTML = '';
                        // clean inline top we set earlier
                        contentRoot.style.top = '';
                        hideLoader(contentRoot);
                        isLoading = false;
                        document.querySelectorAll('.nav-button').forEach(b => { b.removeAttribute('aria-disabled'); b.classList.remove('opacity-50'); b.style.pointerEvents = ''; });
                    }
                    // ensure hero texts are visible according to currentLang
                    renderContent(currentLang, false);
                }, 500);
            }, 900);
        } else {
            // ensure hero texts are visible according to currentLang
            renderContent(currentLang, false);
        }
    }

    // Cambiar idioma
    langEsBtn.addEventListener('click', () => {
        if (currentLang !== 'es') {
            currentLang = 'es';
            // activar glitch solo cuando el usuario cambia el idioma
            renderContent(currentLang, true);
        }
    });

    langEnBtn.addEventListener('click', () => {
        if (currentLang !== 'en') {
            currentLang = 'en';
            // activar glitch solo cuando el usuario cambia el idioma
            renderContent(currentLang, true);
        }
    });

    // Handle hero nav clicks to collapse hero and show sections
    function collapseAndShow(targetId) {
        // Determine target name early so special cases like descarga can be handled
        const name = targetId.replace('#', '');
        // If user clicked Descargar CV, handle it without changing current view state
        if (name === 'descarga') {
            const contentRoot = document.getElementById('content-root');
            const cvEs = data && data.cv_links && data.cv_links.es ? data.cv_links.es : null;
            const cvEn = data && data.cv_links && data.cv_links.en ? data.cv_links.en : null;
            // If only one link present, download directly
            if ((cvEs && !cvEn) || (cvEn && !cvEs)) {
                const url = cvEs || cvEn;
                const a = document.createElement('a');
                a.href = url;
                a.download = '';
                a.target = '_blank';
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                a.remove();
                return;
            }
            // otherwise show modal overlay without collapsing or replacing current section
            showDownloadModal();
            return;
        }

        if (isLoading) return; // prevent concurrent opens
        isLoading = true;
        // visually disable nav while loading
        document.querySelectorAll('.nav-button').forEach(b => { b.setAttribute('aria-disabled','true'); b.classList.add('opacity-50'); b.style.pointerEvents = 'none'; });

        document.body.classList.add('collapsed');
        // show localized title in header when collapsed
        if (pageTitle) {
            pageTitle.textContent = pageTitleForLang(currentLang);
            pageTitle.classList.remove('hidden');
        }
        // section-bar visibility is controlled by CSS via body.collapsed
        const contentRoot = document.getElementById('content-root');
        // Make content-root an overlay fixed beneath the header so it doesn't push layout
        const navEl = document.querySelector('header nav');
        if (contentRoot) {
            const navHeight = navEl ? navEl.offsetHeight : 72;
            contentRoot.style.top = navHeight + 'px';
        }
        const partialPath = `partials/${name}.html`;
        // If user clicked Descargar CV, show download modal instead of loading a partial
        if (name === 'descarga') {
            showDownloadModal();
            updateActiveSection(name);
            return;
        }
        // If the overlay is already visible, do a gentle swap: collapse current section and show new one
        const overlayAlreadyVisible = contentRoot && contentRoot.classList.contains('visible-overlay');

        if (overlayAlreadyVisible) {
            // Collapse any currently visible section first to trigger its hide transition
            const currentlyVisible = contentRoot.querySelector('.content-section.visible');
            if (currentlyVisible) currentlyVisible.classList.remove('visible');

            // wait for the transitionend (opacity or max-height) or fallback after 700ms
            const waitForHide = new Promise(resolve => {
                if (!currentlyVisible) return resolve();
                let resolved = false;
                const onEnd = (ev) => {
                    // respond to opacity or max-height transition end
                    if (ev.propertyName === 'opacity' || ev.propertyName === 'max-height') {
                        if (!resolved) {
                            resolved = true;
                            currentlyVisible.removeEventListener('transitionend', onEnd);
                            resolve();
                        }
                    }
                };
                currentlyVisible.addEventListener('transitionend', onEnd);
                // fallback
                setTimeout(() => { if (!resolved) { resolved = true; currentlyVisible.removeEventListener('transitionend', onEnd); resolve(); } }, 700);
            });

            waitForHide.then(() => {
                // fetch and inject new partial, then show it with the same visible class (short animation)
                showLoader(contentRoot);
                fetch(partialPath).then(resp => {
                    if (!resp.ok) throw new Error('Partial not found');
                    return resp.text();
                }).then(html => {
                    contentRoot.innerHTML = html;
                    const injected = contentRoot.querySelector('.content-section');
                    if (injected) {
                        // render dynamic text inside the injected partial (no glitch)
                        renderContent(currentLang, false);
                        // Update contact links after partial is loaded
                        renderContactLinks();
                        renderPersonalContactLinks();
                        // ensure layout is ready then add visible to trigger transition
                        requestAnimationFrame(() => {
                            injected.classList.add('visible');
                            requestAnimationFrame(() => {
                                try { injected.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
                            });
                            // mark active section after it's visible
                            updateActiveSection(name);
                        });
                    }
                    // reattach handlers if contact form exists in partial
                    const contactFormPartial = document.getElementById('contact-form');
                    if (contactFormPartial) {
                        attachContactFormHandler(contactFormPartial);
                    }
                }).catch(err => {
                    console.error('Error loading partial:', err);
                    showToast('Error al cargar la sección. Intenta de nuevo.', { type: 'error' });
                }).finally(() => {
                    hideLoader(contentRoot);
                    isLoading = false;
                    document.querySelectorAll('.nav-button').forEach(b => { b.removeAttribute('aria-disabled'); b.classList.remove('opacity-50'); b.style.pointerEvents = ''; });
                });
            });
            return;
        }
        // remove any previously loaded content and do the full show (overlay was not visible)
        contentRoot.innerHTML = '';
        // fetch and inject partial
        showLoader(contentRoot);
        fetch(partialPath).then(resp => {
            if (!resp.ok) throw new Error('Partial not found');
            return resp.text();
        }).then(html => {
            contentRoot.innerHTML = html;
            // ensure only the injected section is visible
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('visible'));
            const injected = contentRoot.querySelector('.content-section');
            if (injected) {
                // render dynamic text inside the injected partial (no glitch)
                renderContent(currentLang, false);
                // Update contact links after partial is loaded
                renderContactLinks();
                renderPersonalContactLinks();
                // show overlay and injected content immediately (no artificial delay)
                if (contentRoot) contentRoot.classList.add('visible-overlay');
                injected.classList.add('visible');
                // scroll on next animation frame to ensure layout is ready (no visual jump)
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    try { injected.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { /* ignore */ }
                }));
            }
                // mark active section after first show
                updateActiveSection(name);
                // reattach handlers if contact form exists in partial
            const contactFormPartial = document.getElementById('contact-form');
            if (contactFormPartial) {
                attachContactFormHandler(contactFormPartial);
            }
        }).catch(err => {
            console.error('Error loading partial:', err);
            showToast('Error al cargar la sección. Intenta de nuevo.', { type: 'error' });
        }).finally(() => {
            hideLoader(contentRoot);
            isLoading = false;
            document.querySelectorAll('.nav-button').forEach(b => { b.removeAttribute('aria-disabled'); b.classList.remove('opacity-50'); b.style.pointerEvents = ''; });
        });
    }

    // Attach listeners to hero nav links
    document.querySelectorAll('#inicio .hero-nav a.nav-button').forEach(a => {
        a.addEventListener('click', (e) => {
            // if href is an anchor to a section, intercept
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                collapseAndShow(href);
            }
        });
    });

    // Hero mail: open contact partial
    const heroMail = document.getElementById('hero-mail');
    if (heroMail) {
        heroMail.addEventListener('click', (e) => {
            const href = heroMail.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                collapseAndShow(href);
            }
        });
    }

    // Attach listeners to header section-bar links (so top bar buttons work when visible)
    document.querySelectorAll('#section-bar a.nav-button').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                collapseAndShow(href);
            }
        });
    });

    // Global event delegation for contact links (robust even if hrefs not set yet)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('#contact-email, #contact-linkedin, #contact-github, #personal-contact-email, #personal-contact-linkedin, #personal-contact-github');
        if (!target) return;
        if (!data || !data.contact_info) return;
        e.preventDefault();
        switch (target.id) {
            case 'contact-email':
                if (data.contact_info.email) window.location.href = `mailto:${data.contact_info.email}`;
                break;
            case 'personal-contact-email':
                // About Me email opens contact partial
                collapseAndShow('#contacto');
                break;
            case 'contact-linkedin':
            case 'personal-contact-linkedin':
                if (data.contact_info.linkedin) window.open(data.contact_info.linkedin, '_blank', 'noopener,noreferrer');
                break;
            case 'contact-github':
            case 'personal-contact-github':
                if (data.contact_info.github) window.open(data.contact_info.github, '_blank', 'noopener,noreferrer');
                break;
        }
    });

    // If a contact form exists initially in the DOM (e.g., not using partials), attach handler
    const existingContactForm = document.getElementById('contact-form');
    if (existingContactForm) attachContactFormHandler(existingContactForm);

    // Make page-title clickable to return to inicio
    if (pageTitle) {
        pageTitle.style.cursor = 'pointer';
        pageTitle.addEventListener('click', (e) => {
            e.preventDefault();
            expandToInicio();
        });
    }

        // Update active state for section buttons (both header section-bar and hero nav)
        function updateActiveSection(name) {
                // clear previous
                document.querySelectorAll('#section-bar a.nav-button, #inicio .hero-nav a.nav-button').forEach(el => {
                        el.classList.remove('selected');
                });
                if (!name) return;
                const selector = `a.nav-button[href="#${name}"]`;
                document.querySelectorAll(selector).forEach(el => el.classList.add('selected'));
        }

        // Show download modal with CV buttons (uses data.cv_links)
        function showDownloadModal() {
                const contentRoot = document.getElementById('content-root');
                if (!contentRoot) return;
                // build modal
                const cvEs = data && data.cv_links && data.cv_links.es ? data.cv_links.es : '#';
                const cvEn = data && data.cv_links && data.cv_links.en ? data.cv_links.en : '#';
                const modalHtml = `
                    <div class="download-modal">
                        <div class="download-card">
                            <h3 class="text-2xl font-bold mb-4">Descargar CV</h3>
                            <p class="mb-4">Elige la versión:</p>
                            <div class="flex gap-4 justify-center">
                                <a class="cv-button" href="${cvEs}" download target="_blank" rel="noopener">CV (Español)</a>
                                <a class="cv-button" href="${cvEn}" download target="_blank" rel="noopener">CV (English)</a>
                            </div>
                            <div class="mt-6 text-center">
                                <button class="cv-close">Cerrar</button>
                            </div>
                        </div>
                        <button class="modal-backdrop" aria-label="Cerrar"></button>
                    </div>
                `;
                // append modal element so we don't remove existing content (overlay or section)
                const wrapper = document.createElement('div');
                wrapper.className = 'download-modal-wrapper';
                wrapper.innerHTML = modalHtml;
                const overlayWasVisible = contentRoot.classList.contains('visible-overlay');
                contentRoot.appendChild(wrapper);
                if (!overlayWasVisible) contentRoot.classList.add('visible-overlay');
                // Prevent header/section-bar interactions and mark as modal-open
                const headerEl = document.querySelector('header');
                const sectionBarEl = document.getElementById('section-bar');
                if (headerEl) headerEl.setAttribute('aria-hidden', 'true');
                if (sectionBarEl) sectionBarEl.setAttribute('aria-hidden', 'true');
                document.body.classList.add('modal-open');
                // attach handlers
                const closeBtn = wrapper.querySelector('.cv-close');
                const backdrop = wrapper.querySelector('.modal-backdrop');
                function closeModal() {
                        // remove modal wrapper only
                        wrapper.remove();
                        if (!overlayWasVisible) {
                                contentRoot.classList.remove('visible-overlay');
                        }
                        // Restore header/section-bar accessibility and modal-open state
                        const headerEl2 = document.querySelector('header');
                        const sectionBarEl2 = document.getElementById('section-bar');
                        if (headerEl2) headerEl2.removeAttribute('aria-hidden');
                        if (sectionBarEl2) sectionBarEl2.removeAttribute('aria-hidden');
                        document.body.classList.remove('modal-open');
                }
                if (closeBtn) closeBtn.addEventListener('click', closeModal);
                if (backdrop) backdrop.addEventListener('click', closeModal);
                // Esc to close
                const escHandler = (ev) => { if (ev.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); } };
                document.addEventListener('keydown', escHandler);
        }

    // Carga inicial
    loadDataAndRender();
});

