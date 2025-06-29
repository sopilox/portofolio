document.addEventListener('DOMContentLoaded', () => {
    // ---- Loading Overlay ----
    const loadingOverlay = document.getElementById('loading-overlay');
    // Sembunyikan loading overlay setelah DOM siap
    window.addEventListener('load', () => {
        loadingOverlay.classList.add('hidden');
    });

    // ---- Dark/Light Mode Toggle ----
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Fungsi untuk menerapkan tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            themeToggle.setAttribute('aria-label', 'Toggle light mode');
        } else {
            body.classList.remove('dark-mode');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        }
    }

    // Cek preferensi tema dari localStorage atau sistem
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark'); // Gunakan tema gelap jika sistem OS prefer gelap
    } else {
        applyTheme('light'); // Default ke terang
    }

    // Event listener untuk tombol toggle
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            applyTheme('light');
            localStorage.setItem('theme', 'light');
        } else {
            applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // ---- Smooth Scrolling untuk Navigasi ----
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });

            // Update active link in navigation
            document.querySelectorAll('.main-nav a').forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set active link on initial load or scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.main-nav a');

    function updateActiveNavLink() {
        let currentActive = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - document.querySelector('header').offsetHeight;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentActive = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentActive)) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Panggil saat memuat untuk mengatur link aktif awal


    // ---- Parallax Scrolling untuk Hero Section ----
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            // Kecepatan parallax, nilai yang lebih kecil berarti efek lebih lambat
            heroSection.style.backgroundPositionY = -scrollPos * 0.3 + 'px';
        });
    }

    // ---- Scroll-triggered Animations (menggunakan Intersection Observer) ----
    const animatedElements = document.querySelectorAll('.about-section, .skills-section, .projects-section');
    const heroContentElements = document.querySelectorAll('.hero-intro, .hero-name, .hero-tagline, .hero-description, .cta-button');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Ketika 10% elemen terlihat
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('hidden'); // Hapus hidden agar animasi tidak terulang
                observer.unobserve(entry.target); // Berhenti mengamati setelah terlihat
            }
        });
    }, observerOptions);

    // Tambahkan kelas 'hidden' ke elemen yang akan dianimasikan secara default
    animatedElements.forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });

    // Animasi hero content akan dipicu setelah loading overlay hilang
    loadingOverlay.addEventListener('transitionend', () => {
        if (loadingOverlay.classList.contains('hidden')) {
            heroContentElements.forEach(el => {
                el.style.opacity = '1'; // Untuk memastikan terlihat
                el.style.transform = 'translateY(0)'; // Untuk memastikan posisi akhir
            });
        }
    });

    // ---- Canvas Particle Effect ----
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 100; // Batasi jumlah partikel untuk performa
    const maxRadius = 2; // Ukuran partikel kecil
    const colors = ['#0f4c75', '#3282b8', '#bbe1fa', '#007bff', '#ff6b6b']; // Warna partikel yang sesuai tema

    // Sesuaikan ukuran canvas dengan window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Panggil saat memuat

    // Class untuk setiap partikel
    class Particle {
        constructor(x, y, radius, color, velocity) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.velocity = velocity;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        update() {
            // Memantul dari tepi
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.velocity.x = -this.velocity.x;
            }
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
                this.velocity.y = -this.velocity.y;
            }

            this.x += this.velocity.x;
            this.y += this.velocity.y;

            this.draw();
        }
    }

    // Inisialisasi partikel
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            const radius = Math.random() * maxRadius + 0.5; // Ukuran partikel random
            const x = Math.random() * (canvas.width - radius * 2) + radius;
            const y = Math.random() * (canvas.height - radius * 2) + radius;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const velocity = {
                x: (Math.random() - 0.5) * 0.5, // Kecepatan lambat
                y: (Math.random() - 0.5) * 0.5
            };
            particles.push(new Particle(x, y, radius, color, velocity));
        }
    }

    // Loop animasi partikel
    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Hapus canvas setiap frame
        particles.forEach(particle => {
            particle.update();
        });
    }

    initParticles();
    animateParticles();

    // ---- Update Copyright Year ----
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ---- Show/Hide More Projects ----
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        const projectCards = Array.from(projectsGrid.querySelectorAll('.project-card'));
        const maxVisible = 3;
        if (projectCards.length > maxVisible) {
            // Hide extra projects
            projectCards.forEach((card, idx) => {
                if (idx >= maxVisible) {
                    card.classList.add('hidden-project');
                }
            });
            // Create View More button
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.className = 'view-more-btn';
            viewMoreBtn.innerHTML = 'View More <i class="fas fa-chevron-down"></i>';
            projectsGrid.parentElement.appendChild(viewMoreBtn);

            // Create Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-more-btn';
            closeBtn.innerHTML = 'Close <i class="fas fa-chevron-up"></i>';
            closeBtn.style.display = 'none';
            projectsGrid.parentElement.appendChild(closeBtn);

            // Animation function
            function animateCards(cards, show) {
                cards.forEach((card, i) => {
                    setTimeout(() => {
                        if (show) {
                            card.classList.add('show-project');
                            card.classList.remove('hidden-project');
                        } else {
                            card.classList.remove('show-project');
                            card.classList.add('hidden-project');
                        }
                    }, i * 80);
                });
            }

            viewMoreBtn.addEventListener('click', () => {
                animateCards(projectCards.slice(maxVisible), true);
                viewMoreBtn.style.display = 'none';
                closeBtn.style.display = 'inline-block';
            });
            closeBtn.addEventListener('click', () => {
                animateCards(projectCards.slice(maxVisible), false);
                viewMoreBtn.style.display = 'inline-block';
                closeBtn.style.display = 'none';
                // Scroll to projects section for better UX
                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
});
