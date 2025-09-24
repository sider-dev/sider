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

    // --- Chess Game Activation Triggers ---
    setupChessActivationTriggers();

    function setupChessActivationTriggers() {
        setupPhoneShake();
        setupTypingTrigger();
        setupKonamiCode();
    }

    function setupPhoneShake() {
        if (window.DeviceMotionEvent) {
            let lastUpdate = 0;
            let x = 0, y = 0, z = 0;
            let lastX = 0, lastY = 0, lastZ = 0;
            const shakeThreshold = 800;
            
            window.addEventListener('devicemotion', (e) => {
                const currentTime = new Date().getTime();
                
                if ((currentTime - lastUpdate) > 100) {
                    const diffTime = currentTime - lastUpdate;
                    lastUpdate = currentTime;
                    
                    x = e.accelerationIncludingGravity.x;
                    y = e.accelerationIncludingGravity.y;
                    z = e.accelerationIncludingGravity.z;
                    
                    const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;
                    
                    if (speed > shakeThreshold) {
                        console.log('🎮 Phone shake detected! Activating chess game...');
                        activateChessGame();
                    }
                    
                    lastX = x;
                    lastY = y;
                    lastZ = z;
                }
            });
        }
    }

    function setupTypingTrigger() {
        let typedSequence = '';
        const targetSequence = 'sider';
        const resetTime = 2000;
        let resetTimer;
        
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (document.getElementById('chess-game').style.display === 'flex') return;
            
            clearTimeout(resetTimer);
            
            const char = e.key.toLowerCase();
            if (char.match(/[a-z]/)) {
                typedSequence += char;
                
                if (typedSequence.includes(targetSequence)) {
                    console.log('🎮 Typed "sider" detected! Activating chess game...');
                    activateChessGame();
                    typedSequence = '';
                    return;
                }
                
                if (typedSequence.length > targetSequence.length) {
                    typedSequence = typedSequence.slice(-targetSequence.length);
                }
            }
            
            resetTimer = setTimeout(() => {
                typedSequence = '';
            }, resetTime);
        });
    }

    function setupKonamiCode() {
        const konamiCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        let konamiIndex = 0;
        const resetTime = 3000;
        let resetTimer;
        
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('chess-game').style.display === 'flex') return;
            
            clearTimeout(resetTimer);
            
            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                console.log(`🎮 Konami progress: ${konamiIndex}/${konamiCode.length}`);
                
                if (konamiIndex === konamiCode.length) {
                    console.log('🎮 Konami code completed! Activating chess game...');
                    activateChessGame();
                    konamiIndex = 0;
                    return;
                }
            } else {
                konamiIndex = 0;
            }
            
            resetTimer = setTimeout(() => {
                konamiIndex = 0;
            }, resetTime);
        });
    }

    function activateChessGame() {
        if (window.chessGameManager) {
            window.chessGameManager.showGame();
        } else {
            console.warn('Chess game manager not loaded yet');
            setTimeout(() => {
                if (window.chessGameManager) {
                    window.chessGameManager.showGame();
                }
            }, 500);
        }
    }

    // --- Helper Functions ---
    function scrollToElement(id) {
        const element = document.getElementById(id);
        if (element) {
            const elementTop = element.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
            console.log(`Scrolling to: #${id}`);

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
        if (!synthesis || isSpeaking) return;
        const wasListening = isListening;
        if (wasListening) {
            stopListening();
        }

        utterance.text = text;
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onend = () => {
             console.log("Feedback finished speaking.");
             isSpeaking = false;
             updateReadButtonState();
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesis Error:', event.error);
            isSpeaking = false;
            updateReadButtonState();
        };

        isSpeaking = true;
        updateReadButtonState();
        synthesis.speak(utterance);
        console.log(`Speaking feedback: "${text}"`);
    }

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    if (window.updateMatrixColors) window.updateMatrixColors();

    function updateThemeIcon(theme) {
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
            themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
            themeToggle.setAttribute('title', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            if (window.updateMatrixColors) window.updateMatrixColors();
            console.log(`Theme switched to: ${newTheme}`);
        });
    }

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
            const sectionTop = section.offsetTop - navHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            const lastSectionId = sections[sections.length - 1]?.getAttribute('id');
            if(lastSectionId) current = lastSectionId;
        }

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
    updateActiveNavLink();

    // --- Matrix Rain Animation ---
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
        let rgbaBg = 'rgba(248, 249, 250, 0.05)';
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
         if (currentTheme === 'dark') {
             rgbaBg = 'rgba(18, 24, 39, 0.05)';
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
     const services = [
        { title: 'Mobile Applications', description: 'Native & cross-platform apps delivering exceptional UX across all devices.', icon: 'fa-solid fa-mobile-screen-button' },
        { title: 'Web Development', description: 'Responsive, high-performance websites and complex web applications.', icon: 'fa-solid fa-code' },
        { title: 'Custom Software', description: 'Bespoke solutions tailored precisely to your unique business requirements.', icon: 'fa-solid fa-laptop-code' },
        { title: 'Cloud Architecture', description: 'Scalable, secure, and resilient cloud infrastructure design & migration.', icon: 'fa-solid fa-cloud-arrow-up' },
        { title: 'AI Research & Data Engineering', description: 'Leveraging data analytics & ML to unlock insights and drive decisions.', icon: 'fa-solid fa-brain' },
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

    // --- Scroll Animations ---
    const observerOptions = { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                let itemIndex = 0;
                 if (parent && (parent.classList.contains('services-grid') || parent.classList.contains('features-grid'))) {
                    itemIndex = Array.from(parent.children).filter(child => child.classList.contains(entry.target.classList[0])).indexOf(entry.target);
                 } else if (parent && parent.classList.contains('contact-wrapper')) {
                     itemIndex = Array.from(parent.children).filter(child => child.classList.contains('fade-in')).indexOf(entry.target);
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
         if (!el.classList.contains('fade-in')) {
             el.classList.add('fade-in');
             scrollObserver.observe(el);
         }
     });

    // --- Voice Navigation Implementation ---
    function updateVoiceNavButtonState() {
        if (!voiceNavBtn) return;
        if (isListening) {
            voiceNavBtn.classList.add('listening');
            voiceNavBtn.setAttribute('aria-label', 'Stop Listening');
            voiceNavBtn.title = 'Stop Listening';
        } else {
            voiceNavBtn.classList.remove('listening');
            voiceNavBtn.setAttribute('aria-label', 'Activate Voice Navigation');
             voiceNavBtn.title = 'Activate Voice Navigation';
        }
    }

    function startListening() {
        if (!recognition || isListening) return;

        if (isSpeaking) {
            stopSpeaking();
        }

        try {
            recognition.start();
            isListening = true;
            updateVoiceNavButtonState();
            console.log("Speech recognition started.");
        } catch (error) {
            console.error("Error starting recognition:", error);
             isListening = false;
             updateVoiceNavButtonState();
             if (error.name === 'NotAllowedError') {
                 alert("Microphone access denied. Please allow microphone access in your browser settings.");
             } else if (error.name === 'InvalidStateError'){
                console.warn("Recognition already processing.");
             } else {
                 alert("Could not start voice recognition. Please try again.");
             }
        }
    }

    function stopListening() {
        if (!recognition || !isListening) return;
        recognition.stop();
    }

    if (recognition) {
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase().trim();
            console.log('Voice command received:', command);
            processVoiceCommand(command);
            if (isListening) {
                 isListening = false;
                 updateVoiceNavButtonState();
            }
        };

        recognition.onspeechend = () => {
            console.log("Speech ended.");
             stopListening();
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
            }
             speakFeedback(errorMsg);
             if (isListening) {
                 isListening = false;
                 updateVoiceNavButtonState();
             }
        };

         recognition.onend = () => {
             console.log("Recognition service ended.");
             if (isListening) {
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

        if (command.includes('chess') || command.includes('play chess')) {
            activateChessGame();
            speakFeedback("Activating chess game!");
        } else if (command.includes('home') || command.includes('top')) {
            scrollToElement('home');
        } else if (command.includes('service')) {
            scrollToElement('services');
        } else if (command.includes('why') || command.includes('about')) {
            scrollToElement('why-sider');
        } else if (command.includes('contact') || command.includes('touch') || command.includes('location')) {
            scrollToElement('contact');
        }
        else if (command.includes('scroll down')) {
            window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
            console.log("Scrolling down");
        } else if (command.includes('scroll up')) {
            window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
            console.log("Scrolling up");
        }
         else if (command.includes('dark mode') || command.includes('night mode')) {
             if (document.documentElement.getAttribute('data-theme') !== 'dark') {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
                if (window.updateMatrixColors) window.updateMatrixColors();
                speakFeedback("Switched to dark mode.");
             } else {
                 speakFeedback("Already in dark mode.");
             }
         } else if (command.includes('light mode') || command.includes('day mode')) {
             if (document.documentElement.getAttribute('data-theme') !== 'light') {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme);
                if (window.updateMatrixColors) window.updateMatrixColors();
                speakFeedback("Switched to light mode.");
             } else {
                 speakFeedback("Already in light mode.");
             }
         }
        else if (command.includes('read') || command.includes('speak')) {
             handleReadPage();
        }
         else if (command.includes('stop') || command.includes('cancel') || command.includes('shut up')) {
             if (isSpeaking) stopSpeaking();
             if (isListening) stopListening();
             speakFeedback("Okay.");
         }
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
             readPageBtn.innerHTML = '<i class="fa-solid fa-stop-circle"></i>';
        } else {
            readPageBtn.classList.remove('speaking');
            readPageBtn.setAttribute('aria-label', 'Read Page Content');
            readPageBtn.title = 'Read Page Content';
             readPageBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        }
    }

    function findVisibleSectionForReading() {
        let mostVisibleSection = null;
        let maxVisibility = 0;
        const navOffset = navHeight + 10;

        document.querySelectorAll('section[id][data-readable-section="true"]').forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const visibleTop = Math.max(navOffset, rect.top);
            const visibleBottom = Math.min(windowHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            const sectionHeightBelowNav = Math.max(0, rect.bottom - navOffset);
            const visibilityPercentage = sectionHeightBelowNav > 0 ? (visibleHeight / sectionHeightBelowNav) * 100 : 0;

            if (visibleHeight > 0 && visibilityPercentage > maxVisibility) {
                 if (visibilityPercentage > 20) {
                     maxVisibility = visibilityPercentage;
                     mostVisibleSection = section;
                 }
            }
        });

        if (!mostVisibleSection && sections.length > 0) {
            const firstSectionRect = sections[0].getBoundingClientRect();
             if (firstSectionRect.bottom > navOffset && firstSectionRect.top < window.innerHeight) {
                 mostVisibleSection = sections[0];
             }
        }

        return mostVisibleSection;
    }

     function extractReadableText(sectionElement) {
         if (!sectionElement) return "";
         let text = "";
         const readableElements = sectionElement.querySelectorAll('[data-readable-content="true"]');

         if (readableElements.length > 0) {
             readableElements.forEach(el => {
                 const clone = el.cloneNode(true);
                 clone.querySelectorAll('button, .icon, .icon-wrapper, .btn, a.contact-link').forEach(noisyEl => noisyEl.remove());
                 const elementText = clone.innerText || clone.textContent || "";
                 text += elementText.replace(/\s+/g, ' ').trim() + ". ";
             });
         } else {
              console.warn(`No elements with data-readable-content found in #${sectionElement.id}. Reading fallback text.`);
              const clone = sectionElement.cloneNode(true);
              clone.querySelectorAll('button, .icon, .icon-wrapper, .btn, canvas, script, style, .decorative-shape, nav').forEach(noisyEl => noisyEl.remove());
              text = clone.innerText || clone.textContent || "";
              text = text.replace(/\s+/g, ' ').trim();
         }
         text = text.replace(/\.\s*\./g, '.');

         const sectionTitle = sectionElement.querySelector('h1, h2')?.innerText.trim();
         if (sectionTitle && !text.toLowerCase().includes(sectionTitle.toLowerCase())) {
             text = sectionTitle + ". " + text;
         }

         return text;
     }

    function handleReadPage() {
        if (!synthesis) return;

        if (isSpeaking) {
            stopSpeaking();
            return;
        }

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

        if (!textToRead || textToRead.length < 10) {
             console.log(`Section #${targetSection.id} has insufficient readable text.`);
             const sectionName = targetSection.id.replace(/-/g, ' ');
             speakFeedback(`There isn't much to read in the ${sectionName} section.`);
             return;
        }

        console.log(`Attempting to read section: #${targetSection.id}`);
        utterance.text = textToRead;
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

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

        synthesis.cancel();
        synthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (!synthesis || !isSpeaking) return;
        synthesis.cancel();
        console.log("SpeechSynthesis stopped by user.");
    }

    if (readPageBtn) {
        readPageBtn.addEventListener('click', handleReadPage);
    }

    // --- Subtle Mouse Move Parallax Effect ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const moveX = (clientX / innerWidth - 0.5) * 2;
            const moveY = (clientY / innerHeight - 0.5) * 2;
            const strength = 5;
             requestAnimationFrame(() => {
                heroContent.style.transform = `translate(${moveX * strength * -1}px, ${moveY * strength * -1}px)`;
             });
        });
    }

    // --- Easter Egg Messages ---
    console.log('%c🎮 SIDER.dev Secret Features Enabled! 🎮', 'color: #00ff41; font-size: 16px; font-weight: bold;');
    console.log('%cTry these secret activation methods:', 'color: #4CAF50; font-size: 14px;');
    console.log('%c📱 Shake your phone', 'color: #2196F3; font-size: 12px;');
    console.log('%c⌨️  Type "sider" anywhere', 'color: #FF9800; font-size: 12px;');
    console.log('%c🎮 Konami Code: ↑↑↓↓←→←→BA', 'color: #E91E63; font-size: 12px;');
    console.log('%c🎤 Say "chess" with voice command', 'color: #9C27B0; font-size: 12px;');

}); // End DOMContentLoaded