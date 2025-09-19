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
    const themeSelect = document.getElementById('theme-select');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeSelect) {
        themeSelect.value = currentTheme;
    }
    if (window.updateMatrixColors) window.updateMatrixColors();

    // Handle theme changes
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            const theme = this.value;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            if (window.updateMatrixColors) window.updateMatrixColors();
            console.log(`Theme changed to: ${theme}`);
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
            const sectionTop = section.offsetTop - navHeight - 50; // Extra buffer
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
    updateActiveNavLink(); // Initial call


    // --- Authentic Japanese Matrix Rain Effect with Sushi Recipe Characters ---
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Authentic Japanese characters from sushi recipes and cooking terminology
    const japaneseChars = [
        // Hiragana characters (common in recipes)
        'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'が', 'ぎ', 'ぐ', 'げ', 'ご',
        'さ', 'し', 'す', 'せ', 'そ', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'た', 'ち', 'つ', 'て', 'と',
        'だ', 'ぢ', 'づ', 'で', 'ど', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ',
        'ば', 'び', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ', 'ま', 'み', 'む', 'め', 'も',
        'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', 'ゐ', 'ゑ', 'を', 'ん',
        
        // Katakana characters (used for foreign words)
        'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
        'サ', 'シ', 'ス', 'セ', 'ソ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'タ', 'チ', 'ツ', 'テ', 'ト',
        'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
        'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ', 'ポ', 'マ', 'ミ', 'ム', 'メ', 'モ',
        'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ヰ', 'ヱ', 'ヲ', 'ン',
        
        // Common Kanji used in sushi and cooking
        '寿', '司', '鮨', '魚', '米', '海', '水', '火', '切', '作', '食', '味', '新', '鮮',
        '醤', '油', '酢', '塩', '砂', '糖', '生', '焼', '煮', '茹', '揚', '蒸', '炒', '和',
        '洋', '中', '料', '理', '材', '具', '汁', '出', '昆', '布', '鰹', '節', '味', '噌',
        
        // Sushi-specific terms in various scripts
        'まぐろ', 'さけ', 'たこ', 'えび', 'いか', 'うに', 'いくら', 'あなご', 'さば', 'あじ',
        'トロ', 'サーモン', 'ツナ', 'シャリ', 'ワサビ', 'ガリ', 'ネタ', 'ノリ', 'テッカ', 'カッパ',
        
        // Numbers used in recipes
        '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千',
        '１', '２', '３', '４', '５', '６', '７', '８', '９', '０',
        
        // Cooking measurements and time
        'グラム', 'キロ', 'リットル', 'ミリ', 'センチ', '分', '時間', '秒', '度', '℃',
        
        // Special characters used in Japanese text
        '。', '、', '？', '！', '：', '；', '（', '）', '「', '」', '『', '』', '〈', '〉', '《', '》'
    ];
    
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);
    let charColor = '#00FF41'; // Classic Matrix green
    let frameCount = 0;
    let animationFrameId;

    // Update colors based on theme
    window.updateMatrixColors = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        switch(currentTheme) {
            case 'dark':
                charColor = '#00FF41'; // Classic Matrix green
                break;
            case 'retro':
                charColor = '#00FFFF'; // Cyan for retro
                break;
            case 'light':
            default:
                charColor = 'rgba(0, 255, 65, 0.8)'; // Semi-transparent green for light theme
                break;
        }
    };

    function drawMatrix() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let bgOverlay;
        
        // Theme-specific background overlay
        switch(currentTheme) {
            case 'dark':
                bgOverlay = 'rgba(0, 0, 0, 0.1)';
                break;
            case 'retro':
                bgOverlay = 'rgba(45, 52, 54, 0.1)';
                break;
            case 'light':
            default:
                bgOverlay = 'rgba(248, 249, 250, 0.1)';
                break;
        }
        
        // Create trailing effect
        ctx.fillStyle = bgOverlay;
        ctx.fillRect(0, 0, width, height);
        
        // Set text properties
        ctx.fillStyle = charColor;
        ctx.font = `${fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        
        // Add glow effect for authentic Matrix look
        ctx.shadowColor = charColor;
        ctx.shadowBlur = 8;
        
        for (let i = 0; i < drops.length; i++) {
            // Select random Japanese character
            const char = japaneseChars[Math.floor(Math.random() * japaneseChars.length)];
            const x = i * fontSize + fontSize / 2;
            const y = drops[i] * fontSize;
            
            // Add brightness variation for depth
            const brightness = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
            const alpha = Math.min(1, brightness + 0.2);
            
            // Set character color with brightness variation
            if (currentTheme === 'light') {
                ctx.fillStyle = `rgba(0, 255, 65, ${alpha * 0.8})`;
            } else {
                ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            }
            
            // Draw the character
            ctx.fillText(char, x, y);
            
            // Reset drop position when it goes off screen
            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            // Move drop down
            drops[i]++;
        }
        
        // Reset shadow for next frame
        ctx.shadowBlur = 0;
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
            for(let i=0; i<newColumns; i++) { 
                if (drops[i] === undefined) drops[i] = 1; 
            }
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
            serviceCard.classList.add('service-card', 'fade-in'); // Add fade-in class for animation
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
    const observerOptions = { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                let itemIndex = 0;
                // Check if parent is one of the grids to calculate index correctly
                 if (parent && (parent.classList.contains('services-grid') || parent.classList.contains('features-grid'))) {
                    itemIndex = Array.from(parent.children).filter(child => child.classList.contains(entry.target.classList[0])).indexOf(entry.target);
                 } else if (parent && parent.classList.contains('contact-wrapper')) {
                     // Handle direct children of contact-wrapper (like contact-info, office-locations)
                     itemIndex = Array.from(parent.children).filter(child => child.classList.contains('fade-in')).indexOf(entry.target);
                 }


                const delay = itemIndex * 100; // Stagger delay in ms
                entry.target.style.transitionDelay = `${delay}ms`;
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    };
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
    // Observe all elements initially marked with 'fade-in'
    document.querySelectorAll('.fade-in').forEach(el => scrollObserver.observe(el));
     // Also observe section headers (if they weren't already marked with fade-in)
     document.querySelectorAll('.section-header').forEach(el => {
         if (!el.classList.contains('fade-in')) {
             el.classList.add('fade-in');
             scrollObserver.observe(el);
         }
     });


    // --- Form Submission Placeholder ---
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
        } else {
            voiceNavBtn.classList.remove('listening');
            voiceNavBtn.setAttribute('aria-label', 'Activate Voice Navigation');
             voiceNavBtn.title = 'Activate Voice Navigation';
        }
    }

    function startListening() {
        if (!recognition || isListening) return;

        if (isSpeaking) {
            stopSpeaking(); // Stop speaking before listening
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
                // Can happen if start() is called again too quickly
                console.warn("Recognition already processing.");
             } else {
                 alert("Could not start voice recognition. Please try again.");
             }
        }
    }

    function stopListening() {
        if (!recognition || !isListening) return;
        recognition.stop(); // This will trigger the onend event
        // State update happens in onend
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
            // Stop listening state *after* processing command
            // recognition.stop() might have already been called by onspeechend
            if (isListening) {
                 isListening = false;
                 updateVoiceNavButtonState();
            }
        };

        recognition.onspeechend = () => {
            console.log("Speech ended.");
            // Don't necessarily stop listening here, wait for result or error
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
                // Avoid alert here as permission prompt should handle it
            }
             speakFeedback(errorMsg);
             if (isListening) { // Only stop if it thinks it's listening
                 isListening = false;
                 updateVoiceNavButtonState();
             }
        };

         recognition.onend = () => {
             console.log("Recognition service ended.");
             // Ensure button state is correct if stopped for any reason
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

        if (command.includes('home') || command.includes('top')) {
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
                if (themeSelect) {
                    themeSelect.value = 'dark';
                    themeSelect.dispatchEvent(new Event('change'));
                }
                speakFeedback("Switched to dark mode.");
             } else {
                 speakFeedback("Already in dark mode.");
             }
         } else if (command.includes('light mode') || command.includes('day mode')) {
             if (document.documentElement.getAttribute('data-theme') !== 'light') {
                 if (themeSelect) {
                     themeSelect.value = 'light';
                     themeSelect.dispatchEvent(new Event('change'));
                 }
                speakFeedback("Switched to light mode.");
             } else {
                 speakFeedback("Already in light mode.");
             }
         } else if (command.includes('retro mode') || command.includes('retro theme') || command.includes('80s mode')) {
             if (document.documentElement.getAttribute('data-theme') !== 'retro') {
                 if (themeSelect) {
                     themeSelect.value = 'retro';
                     themeSelect.dispatchEvent(new Event('change'));
                 }
                speakFeedback("Switched to retro mode.");
             } else {
                 speakFeedback("Already in retro mode.");
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
        const navOffset = navHeight + 10; // Consider space below nav

        document.querySelectorAll('section[id][data-readable-section="true"]').forEach(section => {
            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Calculate visible portion considering nav bar
            const visibleTop = Math.max(navOffset, rect.top); // Start check below nav
            const visibleBottom = Math.min(windowHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            // Calculate percentage visibility based on the part below the nav
            const sectionHeightBelowNav = Math.max(0, rect.bottom - navOffset);
            const visibilityPercentage = sectionHeightBelowNav > 0 ? (visibleHeight / sectionHeightBelowNav) * 100 : 0;

            // Prioritize section most visible *below the navbar*
            if (visibleHeight > 0 && visibilityPercentage > maxVisibility) {
                // Check if it's significantly visible (e.g., > 20% of its height below nav)
                 if (visibilityPercentage > 20) {
                     maxVisibility = visibilityPercentage;
                     mostVisibleSection = section;
                 }
            }
        });

        // Fallback: If nothing clearly below nav, check if *any* part of first section is visible
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
                 // Clone node to avoid modifying the original DOM (e.g., removing hidden elements)
                 const clone = el.cloneNode(true);
                 // Remove potentially noisy elements (buttons, icons explicitly inside readable content)
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
         text = text.replace(/\.\s*\./g, '.'); // Remove double periods

         // Add section title if not already included
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

        synthesis.cancel(); // Cancel previous before speaking
        synthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (!synthesis || !isSpeaking) return;
        synthesis.cancel();
        // State update (isSpeaking=false, button update) handled by utterance.onend or utterance.onerror
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
            // Apply with requestAnimationFrame for better performance
             requestAnimationFrame(() => {
                heroContent.style.transform = `translate(${moveX * strength * -1}px, ${moveY * strength * -1}px)`;
             });
        });
    }

}); // End DOMContentLoaded