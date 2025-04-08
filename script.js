document.addEventListener('DOMContentLoaded', function() {
    // --- Theme Switch ---
    const themeCheckbox = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeCheckbox.checked = false; // Dark mode = unchecked in this setup
        } else {
             themeCheckbox.checked = true; // Light mode = checked
        }
        // Initial call to update matrix colors if needed immediately
        if (window.updateMatrixColors) window.updateMatrixColors();
    } else {
        // Default to light theme if no preference saved
        document.documentElement.setAttribute('data-theme', 'light');
        themeCheckbox.checked = true;
    }

    themeCheckbox.addEventListener('change', function() {
        let theme;
        if (this.checked) { // Checked = Light Mode
             theme = 'light';
        } else { // Unchecked = Dark Mode
            theme = 'dark';
        }
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Update matrix colors when theme changes
        if (window.updateMatrixColors) window.updateMatrixColors();
    });


    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        // Optional: Prevent body scroll when menu is open
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = ''; // Re-enable scroll
            }
        });
    });

    // Close mobile menu if clicking outside of it
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnButton = mobileMenuBtn.contains(event.target);

        if (!isClickInsideNav && !isClickOnButton && navLinks.classList.contains('active')) {
             mobileMenuBtn.classList.remove('active');
             navLinks.classList.remove('active');
             document.body.style.overflow = ''; // Re-enable scroll
        }
    });

     // --- Active Nav Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navListItems = document.querySelectorAll('.nav-links li a');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 90; // Offset for fixed nav
             const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

         // Special case for bottom of page - highlight last section if applicable
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) { // near bottom
             const lastSectionId = sections[sections.length - 1].getAttribute('id');
             if (lastSectionId === 'contact') { // Check if last section is contact
                 current = lastSectionId;
             }
         }


        navListItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').substring(1) === current) {
                a.classList.add('active');
            }
        });
         // Default to Home if nothing else is active (e.g., at the very top)
         if (!current && scrollY < sections[0].offsetTop - 90) {
            navListItems.forEach(a => {
                if(a.getAttribute('href') === '#home') {
                    a.classList.add('active');
                }
            });
         }
    });


    // --- Enhanced Matrix Rain Animation (Canvas) ---
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Characters to use - expanded set
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/?=+-*[]{}_|#@!$%^&():;'.split('');
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1); // Start drops at y=1
    let charColor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-char-color').trim();
    let frameCount = 0;
    let animationFrameId;

    // Function to get current theme color
    window.updateMatrixColors = () => {
        charColor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-char-color').trim();
        // Re-draw background on theme change if needed (or let gradient handle it)
        // ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--matrix-bg-color').trim(); // Less performant
        // ctx.fillRect(0, 0, width, height);
    };

    function drawMatrix() {
        // Semi-transparent background for fading effect
        // Adjust alpha for trail length (lower = longer trails)
        ctx.fillStyle = 'rgba(var(--background-color-rgb), 0.05)'; // Needs --background-color-rgb variable set
        // Fallback or define --background-color-rgb in CSS based on theme
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
        if (bgColor.startsWith('#')) { // Convert hex to rgb for rgba
            const r = parseInt(bgColor.substring(1, 3), 16);
            const g = parseInt(bgColor.substring(3, 5), 16);
            const b = parseInt(bgColor.substring(5, 7), 16);
             ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.05)`;
        } else {
            ctx.fillStyle = 'rgba(248, 249, 250, 0.05)'; // Default light fallback
             if (document.documentElement.getAttribute('data-theme') === 'dark') {
                 ctx.fillStyle = 'rgba(18, 24, 39, 0.05)'; // Default dark fallback
             }
        }

        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = charColor; // Use theme variable
        ctx.font = fontSize + 'px monospace'; // Monospace looks better

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            ctx.fillText(text, x, y);

            // Randomly reset drop to top, or move down
            // Add randomness to reset condition for more variation
            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        frameCount++;
    }

    function animateMatrix() {
        drawMatrix();
        animationFrameId = requestAnimationFrame(animateMatrix);
    }

    // Debounce resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cancelAnimationFrame(animationFrameId); // Stop previous loop
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
             const newColumns = Math.floor(width / fontSize);
            // Adjust drops array, keeping existing positions if possible
            drops.length = newColumns;
            for(let i=0; i<newColumns; i++) {
                if (drops[i] === undefined) drops[i] = 1; // Initialize new columns
            }

            updateMatrixColors(); // Update colors on resize too
            animateMatrix(); // Restart animation
        }, 250); // Wait 250ms after resize stops
    });


    // Initial setup and start
    updateMatrixColors(); // Set initial colors
    animateMatrix(); // Start the animation


    // --- Service Cards Data ---
    const services = [
        { title: 'Mobile Applications', description: 'Native & cross-platform apps delivering exceptional UX across all devices.', icon: 'fa-solid fa-mobile-screen-button' },
        { title: 'Web Development', description: 'Responsive, high-performance websites and complex web applications.', icon: 'fa-solid fa-code' },
        { title: 'Custom Software', description: 'Bespoke solutions tailored precisely to your unique business requirements.', icon: 'fa-solid fa-laptop-code' },
        { title: 'Cloud Architecture', description: 'Scalable, secure, and resilient cloud infrastructure design & migration.', icon: 'fa-solid fa-cloud-arrow-up' },
        { title: 'AI & Data Engineering', description: 'Leveraging data analytics & ML to unlock insights and drive decisions.', icon: 'fa-solid fa-brain' }, // Changed icon
        { title: 'E-Commerce Platforms', description: 'End-to-end digital commerce with seamless UX and payment integration.', icon: 'fa-solid fa-store' }, // Changed icon
        { title: 'FinTech Solutions', description: 'Secure, compliant financial technology applications for the digital economy.', icon: 'fa-solid fa-chart-line' },
        { title: 'Cybersecurity', description: 'Comprehensive security strategies to protect your valuable digital assets.', icon: 'fa-solid fa-shield-halved' },
        { title: 'Blockchain & Web3', description: 'Decentralized applications, smart contracts, and Web3 integrations.', icon: 'fa-solid fa-cubes' } // Changed icon
    ];

    // Populate service cards
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.classList.add('service-card', 'fade-in'); // Add fade-in class
            serviceCard.innerHTML = `
                <div class="icon"><i class="${service.icon}"></i></div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
            `;
            servicesGrid.appendChild(serviceCard);
        });
    } else {
        console.error("Services grid not found.");
    }

    // --- Scroll Animations (Staggered Fade-In) ---
    const observerOptions = {
        root: null,
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it's fully in view
    };

    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Calculate delay based on index within its parent grid/container
                const parent = entry.target.parentElement;
                let itemIndex = 0;
                if (parent && (parent.classList.contains('services-grid') || parent.classList.contains('features-grid'))) {
                   itemIndex = Array.from(parent.children).indexOf(entry.target);
                }
                const delay = itemIndex * 100; // Stagger delay in ms

                entry.target.style.transitionDelay = `${delay}ms`;
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    };

    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    // Observe elements with 'fade-in' class
    document.querySelectorAll('.fade-in').forEach(el => {
        scrollObserver.observe(el);
    });
     // Also observe section headers if needed
     document.querySelectorAll('.section-header').forEach(el => {
         el.classList.add('fade-in'); // Add class if not already present
         scrollObserver.observe(el);
     });


    // --- Form Submission Placeholder (if uncommented) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const submitButton = contactForm.querySelector('.submit-btn'); // Assuming button has this class

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

             // Simulate loading state
            if (submitButton) {
                submitButton.classList.add('loading');
                submitButton.disabled = true; // Disable button during load
            }


            // Get form data (optional for demo)
            const formData = {
                name: contactForm.querySelector('#name')?.value,
                email: contactForm.querySelector('#email')?.value,
                subject: contactForm.querySelector('#subject')?.value,
                message: contactForm.querySelector('#message')?.value
            };
            console.log("Form Data:", formData); // Log data

            // Simulate network request
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                this.reset(); // Clear the form

                // Reset button state
                 if (submitButton) {
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
            }, 1500); // Simulate 1.5 second delay
        });
    }


    // --- Voice Navigation & Reading Placeholders ---
    const voiceNavBtn = document.getElementById('voice-nav-btn');
    const readPageBtn = document.getElementById('read-page-btn');

    if (voiceNavBtn) {
        voiceNavBtn.addEventListener('click', () => {
            console.log("Voice Navigation button clicked.");
            if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
                alert("Voice navigation feature placeholder: Would start listening here.");
                // Actual implementation would involve:
                // const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                // recognition.lang = 'en-US';
                // recognition.interimResults = false;
                // recognition.maxAlternatives = 1;
                // recognition.start();
                // recognition.onresult = (event) => { /* Process command */ }
                // recognition.onerror = (event) => { /* Handle error */ }
            } else {
                alert("Sorry, your browser doesn't support Voice Recognition.");
            }
        });
    }

    if (readPageBtn) {
        readPageBtn.addEventListener('click', () => {
            console.log("Read Page button clicked.");
             if ('speechSynthesis' in window) {
                 alert("Read page feature placeholder: Would start reading content here.");
                // Actual implementation would involve:
                // const utterance = new SpeechSynthesisUtterance();
                // utterance.text = /* Extract relevant page text */ document.body.innerText; // Simplified
                // utterance.lang = 'en-US';
                // window.speechSynthesis.speak(utterance);
                // To stop: window.speechSynthesis.cancel();
             } else {
                 alert("Sorry, your browser doesn't support Speech Synthesis.");
             }
        });
    }

    // --- Subtle Mouse Move Parallax Effect (Example on Hero) ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Calculate movement amounts (-1 to 1 range)
            const moveX = (clientX / innerWidth - 0.5) * 2; // -1 (left) to 1 (right)
            const moveY = (clientY / innerHeight - 0.5) * 2; // -1 (top) to 1 (bottom)

            // Apply subtle transform (adjust strength as needed)
            const strength = 5; // Pixels of movement
            heroContent.style.transform = `translate(${moveX * strength * -1}px, ${moveY * strength * -1}px)`;
             // Apply to other elements if desired with different strengths/directions
        });
        // Reset transform when mouse leaves window? Optional.
    }


}); // End DOMContentLoaded
