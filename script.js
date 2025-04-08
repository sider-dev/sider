document.addEventListener('DOMContentLoaded', function() {

    // --- Globals & State ---
    let isListening = false;
    let isSpeaking = false;
    const navHeight = document.querySelector('nav')?.offsetHeight || 80; // Get nav height for scroll offset

    // --- API Availability Check ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    const synthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();

    // Get Button Elements
    const voiceNavBtn = document.getElementById('voice-nav-btn');
    const readPageBtn = document.getElementById('read-page-btn');

    // Enable buttons if APIs are supported
    if (recognition && voiceNavBtn) {
        voiceNavBtn.disabled = false;
        console.log("Speech Recognition API available.");
    } else {
        console.warn("Speech Recognition API not available.");
    }
    if (synthesis && readPageBtn) {
        readPageBtn.disabled = false;
        console.log("Speech Synthesis API available.");
    } else {
        console.warn("Speech Synthesis API not available.");
    }


    // --- Helper Functions ---
    function scrollToElement(id) {
        const element = document.getElementById(id);
        if (element) {
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset - navHeight - 20; // Adjust for nav and add buffer
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
            console.log(`Scrolling to: #${id}`);

            // Close mobile menu if open after navigation
            if (navLinks.classList.contains('active')) {
                 mobileMenuBtn.classList.remove('active');
                 navLinks.classList.remove('active');
                 document.body.style.overflow = '';
            }
        } else {
            console.warn(`Element with ID #${id} not found.`);
            speakFeedback(`Sorry, I could not find the ${id} section.`);
        }
    }

    function speakFeedback(text) {
        if (!synthesis || isSpeaking) return; // Don't interrupt itself or if unavailable
        // Temporarily stop recognition if it's active
        const wasListening = isListening;
        if (wasListening) {
            stopListening();
        }

        utterance.text = text;
        utterance.rate = 1;
        utterance.pitch = 1;
        // Optional: Choose a voice
        // const voices = synthesis.getVoices();
        // utterance.voice = voices[/* index of desired voice */];

        // Use onend to potentially restart listening if it was interrupted
        utterance.onend = () => {
             console.log("Feedback finished speaking.");
             isSpeaking = false; // Reset speaking flag
             updateReadButtonState(); // Update button style
             // Optional: Resume listening if it was interrupted by feedback
             // if (wasListening) {
             //    startListening();
             // }
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesis Error:', event.error);
            isSpeaking = false; // Reset flag on error
            updateReadButtonState();
        };

        isSpeaking = true;
        updateReadButtonState();
        synthesis.speak(utterance);
        console.log(`Speaking feedback: "${text}"`);
    }

    // --- Theme Switch ---
    const themeCheckbox = document.getElementById('theme-checkbox');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        themeCheckbox.checked = (currentTheme === 'light'); // Light = checked
        if (window.updateMatrixColors) window.updateMatrixColors();
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeCheckbox.checked = true; // Default light = checked
    }

    themeCheckbox.addEventListener('change', function() {
        const theme = this.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (window.updateMatrixColors) window.updateMatrixColors();
    });


    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
            // Smooth scroll handled by default browser behavior or scrollToElement if needed
        });
    });

    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnButton = mobileMenuBtn.contains(event.target);
        if (!isClickInsideNav && !isClickOnButton && navLinks.classList.contains('active')) {
             mobileMenuBtn.classList.remove('active');
             navLinks.classList.remove('active');
             document.body.style.overflow = '';
        }
    });


    // --- Active Nav Link Highlighting on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navListItems = document.querySelectorAll('.nav-links li a');

     const updateActiveNavLink = () => {
        let current = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
             // Adjust top offset calculation for accuracy
            const sectionTop = section.offsetTop - navHeight - 50; // Extra buffer
            const sectionBottom = sectionTop + section.offsetHeight;

            // Check if the section is significantly in view
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        // Handle edge case when scrolled to the very bottom
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            const lastSectionId = sections[sections.length - 1]?.getAttribute('id');
            if(lastSectionId) current = lastSectionId;
        }

         // Handle edge case when scrolled to the very top
         if (scrollY < sections[0].offsetTop - navHeight - 50) {
             current = 'home';
         }

        navListItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href')?.substring(1) === current) {
                a.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial call


    // --- Enhanced Matrix Rain Animation (Canvas) ---
    // (Keep the existing Matrix code here - no changes needed for voice/read)
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/?=+-*[]{}_|#@!$%^&():;'.split('');
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);
    let charColor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-char-color').trim();
    let frameCount = 0;
    let animationFrameId;

    window.updateMatrixColors = () => {
        charColor = getComputedStyle(document.documentElement).getPropertyValue('--matrix-char-color').trim();
    };

    function drawMatrix() {
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
        let rgbaBg = 'rgba(248, 249, 250, 0.05)'; // Default light fallback
         if (document.documentElement.getAttribute('data-theme') === 'dark') {
             rgbaBg = 'rgba(18, 24, 39, 0.05)'; // Default dark fallback
         }
         if (bgColor.startsWith('#')) {
            const r = parseInt(bgColor.substring(1, 3), 16);
            const g = parseInt(bgColor.substring(3, 5), 16);
            const b = parseInt(bgColor.substring(5, 7), 16);
             rgbaBg = `rgba(${r}, ${g}, ${b}, 0.05)`;
        }
        ctx.fillStyle = rgbaBg;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = charColor;
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            ctx.fillText(text, x, y);
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
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            const newColumns = Math.floor(width / fontSize);
            drops.length = newColumns;
            for(let i=0; i<newColumns; i++) { if (drops[i] === undefined) drops[i] = 1; }
            updateMatrixColors();
            animateMatrix();
        }, 250);
    });
    updateMatrixColors();
    animateMatrix();


    // --- Service Cards Data & Population ---
    // (Keep the existing service card code - no changes needed for voice/read)
     const services = [
        { title: 'Mobile Applications', description: 'Native & cross-platform apps delivering exceptional UX across all devices.', icon: 'fa-solid fa-mobile-screen-button' },
        { title: 'Web Development', description: 'Responsive, high-performance websites and complex web applications.', icon: 'fa-solid fa-code' },
        { title: 'Custom Software', description: 'Bespoke solutions tailored precisely to your unique business requirements.', icon: 'fa-solid fa-laptop-code' },
        { title: 'Cloud Architecture', description: 'Scalable, secure, and resilient cloud infrastructure design & migration.', icon: 'fa-solid fa-cloud-arrow-up' },
        { title: 'AI & Data Engineering', description: 'Leveraging data analytics & ML to unlock insights and drive decisions.', icon: 'fa-solid fa-brain' },
        { title: 'E-Commerce Platforms', description: 'End-to-end digital commerce with seamless UX and payment integration.', icon: 'fa-solid fa-store' },
        { title: 'FinTech Solutions', description: 'Secure, compliant financial technology applications for the digital economy.', icon: 'fa-solid fa-chart-line' },
        { title: 'Cybersecurity', description: 'Comprehensive security strategies to protect your valuable digital assets.', icon: 'fa-solid fa-shield-halved' },
        { title: 'Blockchain & Web3', description: 'Decentralized applications, smart contracts, and Web3 integrations.', icon: 'fa-solid fa-cubes' }
    ];
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.classList.add('service-card', 'fade-in');
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
    // (Keep the existing IntersectionObserver code - no changes needed)
    const observerOptions = { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                let itemIndex = 0;
                if (parent && (parent.classList.contains('services-grid') || parent.classList.contains('features-grid'))) {
                   itemIndex = Array.from(parent.children).indexOf(entry.target);
                }
                const delay = itemIndex * 100;
                entry.target.style.transitionDelay = `${delay}ms`;
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    };
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));
    document.querySelectorAll('.section-header').forEach(el => {
         el.classList.add('fade-in');
         scrollObserver.observe(el);
     });


    // --- Form Submission Placeholder ---
    // (Keep existing form code - no changes needed)
    const contactForm = document.getElementById('contact-form');
     if (contactForm) {
        const submitButton = contactForm.querySelector('.submit-btn');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (submitButton) { submitButton.classList.add('loading'); submitButton.disabled = true; }
            const formData = { /* ... get data ... */ };
            console.log("Form Data:", formData);
            setTimeout(() => {
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
                 if (submitButton) { submitButton.classList.remove('loading'); submitButton.disabled = false; }
            }, 1500);
        });
    }


    // --- Voice Navigation Implementation ---
    function updateVoiceNavButtonState() {
        if (!voiceNavBtn) return;
        if (isListening) {
            voiceNavBtn.classList.add('listening');
            voiceNavBtn.setAttribute('aria-label', 'Stop Listening');
            voiceNavBtn.title = 'Stop Listening';
            // Optional: Change icon
            // voiceNavBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
        } else {
            voiceNavBtn.classList.remove('listening');
            voiceNavBtn.setAttribute('aria-label', 'Activate Voice Navigation');
             voiceNavBtn.title = 'Activate Voice Navigation';
            // Optional: Change icon back
            // voiceNavBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        }
    }

    function startListening() {
        if (!recognition || isListening) return;

        // Stop speaking if it's active
        if (isSpeaking) {
            stopSpeaking();
        }

        try {
            recognition.start();
            isListening = true;
            updateVoiceNavButtonState();
            console.log("Speech recognition started.");
        } catch (error) {
            // Catch potential errors like starting too soon after stopping
            console.error("Error starting recognition:", error);
             isListening = false;
             updateVoiceNavButtonState();
             if (error.name === 'NotAllowedError') {
                 alert("Microphone access denied. Please allow microphone access in your browser settings.");
             } else if (error.name === 'InvalidStateError'){
                 // Ignore if it's already started or stopping
             } else {
                 alert("Could not start voice recognition. Please try again.");
             }
        }
    }

    function stopListening() {
        if (!recognition || !isListening) return;
        recognition.stop();
        isListening = false;
        updateVoiceNavButtonState();
        console.log("Speech recognition stopped.");
    }

    if (recognition) {
        recognition.continuous = false; // Listen for a single command
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase().trim();
            console.log('Voice command received:', command);
            processVoiceCommand(command);
            // Stop listening automatically after processing a command
             stopListening();
        };

        recognition.onspeechend = () => {
            console.log("Speech ended.");
             stopListening(); // Stop if user stops talking
        };

        recognition.onerror = (event) => {
            console.error('Speech Recognition Error:', event.error);
            let errorMsg = "An error occurred during voice recognition.";
            if (event.error === 'no-speech') {
                errorMsg = "No speech detected. Please try again.";
            } else if (event.error === 'audio-capture') {
                errorMsg = "Microphone problem. Please check your microphone.";
            } else if (event.error === 'not-allowed') {
                errorMsg = "Microphone access denied.";
                alert("Microphone access is needed for voice navigation. Please allow access in browser settings.");
            }
             speakFeedback(errorMsg); // Give audible feedback
             stopListening(); // Ensure state is reset
        };

         recognition.onend = () => {
             console.log("Recognition service ended.");
             // Ensure button state is correct if stopped unexpectedly
             if (isListening) { // Check flag before resetting
                 isListening = false;
                 updateVoiceNavButtonState();
             }
         };

        voiceNavBtn?.addEventListener('click', () => {
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });
    }

    function processVoiceCommand(command) {
        console.log(`Processing command: "${command}"`);

        // Basic Navigation
        if (command.includes('home') || command.includes('top')) {
            scrollToElement('home');
        } else if (command.includes('service')) {
            scrollToElement('services');
        } else if (command.includes('why') || command.includes('about')) {
            scrollToElement('why-sider');
        } else if (command.includes('contact') || command.includes('touch')) {
            scrollToElement('contact');
        }
        // Scrolling
        else if (command.includes('scroll down')) {
            window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
            console.log("Scrolling down");
        } else if (command.includes('scroll up')) {
            window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
            console.log("Scrolling up");
        }
         // Theme Switching
         else if (command.includes('dark mode') || command.includes('night mode')) {
             if (document.documentElement.getAttribute('data-theme') !== 'dark') {
                themeCheckbox.checked = false;
                themeCheckbox.dispatchEvent(new Event('change')); // Trigger change event
                speakFeedback("Switched to dark mode.");
             } else {
                 speakFeedback("Already in dark mode.");
             }
         } else if (command.includes('light mode') || command.includes('day mode')) {
             if (document.documentElement.getAttribute('data-theme') !== 'light') {
                 themeCheckbox.checked = true;
                 themeCheckbox.dispatchEvent(new Event('change')); // Trigger change event
                speakFeedback("Switched to light mode.");
             } else {
                 speakFeedback("Already in light mode.");
             }
         }
        // Reading
        else if (command.includes('read') || command.includes('speak')) {
             handleReadPage();
        }
         // Stop command
         else if (command.includes('stop') || command.includes('cancel') || command.includes('shut up')) {
             if (isSpeaking) stopSpeaking();
             if (isListening) stopListening(); // Also stop listening if told to stop
             speakFeedback("Okay."); // Optional feedback
         }
        // Unknown command
        else {
            speakFeedback("Sorry, I didn't understand that command.");
            console.log("Unknown command:", command);
        }
    }


    // --- Read Page Implementation ---
     function updateReadButtonState() {
        if (!readPageBtn) return;
        if (isSpeaking) {
            readPageBtn.classList.add('speaking');
            readPageBtn.setAttribute('aria-label', 'Stop Reading');
            readPageBtn.title = 'Stop Reading';
            // Optional: Change icon
             readPageBtn.innerHTML = '<i class="fa-solid fa-stop-circle"></i>';
        } else {
            readPageBtn.classList.remove('speaking');
            readPageBtn.setAttribute('aria-label', 'Read Page Content');
            readPageBtn.title = 'Read Page Content';
            // Optional: Change icon back
             readPageBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    }

    function findVisibleSectionForReading() {
        let mostVisibleSection = null;
        let maxVisibility = 0;

        document.querySelectorAll('section[id][data-readable-section="true"]').forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate visible height
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(windowHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

             // Calculate percentage visibility
             const sectionHeight = rect.height;
             const visibilityPercentage = sectionHeight > 0 ? (visibleHeight / sectionHeight) * 100 : 0;

            // Check if this section is more visible than the current max
            // Prioritize sections that are at least partially visible and take up a good portion of viewport
            if (visibleHeight > 0 && visibilityPercentage > maxVisibility) {
                // Basic check: is at least 10% visible OR takes up 30% of viewport?
                if (visibilityPercentage > 10 || visibleHeight / windowHeight > 0.3) {
                     maxVisibility = visibilityPercentage;
                     mostVisibleSection = section;
                }
            }
        });

         // Fallback to the first section if nothing else is clearly visible (e.g., top of page)
        if (!mostVisibleSection && window.pageYOffset < window.innerHeight * 0.5) {
             mostVisibleSection = document.querySelector('section[id][data-readable-section="true"]');
        }

        return mostVisibleSection;
    }

     function extractReadableText(sectionElement) {
         if (!sectionElement) return "";
         let text = "";
         // Find elements marked specifically for reading within the section
         const readableElements = sectionElement.querySelectorAll('[data-readable-content="true"]');

         if (readableElements.length > 0) {
             readableElements.forEach(el => {
                 // Simple approach: get innerText, clean up whitespace
                 const elementText = el.innerText || el.textContent || "";
                 text += elementText.replace(/\s+/g, ' ').trim() + ". "; // Add period for sentence breaks
             });
         } else {
             // Fallback: Read the whole section's text if no specific elements marked
             // Be cautious, this might include unwanted text (buttons, etc.)
              console.warn(`No elements with data-readable-content found in #${sectionElement.id}. Reading entire section (may be noisy).`);
              text = sectionElement.innerText || sectionElement.textContent || "";
              text = text.replace(/\s+/g, ' ').trim();
         }

         // Further clean-up (optional)
         text = text.replace(/\.\s*\./g, '.'); // Remove double periods

         return text;
     }


    function handleReadPage() {
        if (!synthesis) return;

        if (isSpeaking) {
            stopSpeaking();
            return;
        }

         // Stop listening if active
        if (isListening) {
            stopListening();
        }


        const targetSection = findVisibleSectionForReading();
        if (!targetSection) {
            console.log("No readable section found in view.");
             speakFeedback("I can't find anything specific to read right now.");
            return;
        }

        const textToRead = extractReadableText(targetSection);

        if (!textToRead || textToRead.length < 10) { // Avoid reading very short/empty strings
             console.log(`Section #${targetSection.id} has insufficient readable text.`);
             speakFeedback(`There isn't much to read in the ${targetSection.id.replace(/-/g, ' ')} section.`);
             return;
        }

        console.log(`Attempting to read section: #${targetSection.id}`);
        utterance.text = textToRead;
        utterance.lang = 'en-US'; // Ensure language is set
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0; // Normal pitch

        utterance.onstart = () => {
            isSpeaking = true;
            updateReadButtonState();
            console.log("SpeechSynthesis started.");
        };

        utterance.onend = () => {
            isSpeaking = false;
            updateReadButtonState();
            console.log("SpeechSynthesis finished.");
        };

        utterance.onerror = (event) => {
            console.error('SpeechSynthesis Error:', event.error);
            isSpeaking = false;
            updateReadButtonState();
            alert("Sorry, an error occurred while trying to read the page.");
        };

        // Cancel any previous utterance just in case
        synthesis.cancel();
        // Start speaking
        synthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (!synthesis || !isSpeaking) return;
        synthesis.cancel(); // Stop speaking immediately
        isSpeaking = false;
        updateReadButtonState();
        console.log("SpeechSynthesis stopped by user.");
    }

    if (readPageBtn) {
        readPageBtn.addEventListener('click', handleReadPage);
    }


    // --- Subtle Mouse Move Parallax Effect ---
    // (Keep existing parallax code - no changes needed)
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const moveX = (clientX / innerWidth - 0.5) * 2;
            const moveY = (clientY / innerHeight - 0.5) * 2;
            const strength = 5;
            heroContent.style.transform = `translate(${moveX * strength * -1}px, ${moveY * strength * -1}px)`;
        });
    }

}); // End DOMContentLoaded
