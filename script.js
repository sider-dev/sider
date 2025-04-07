document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Binary animation in hero section
    const binaryContainer = document.getElementById('binary-animation');
    
    function createBinaryElement() {
        const el = document.createElement('div');
        el.classList.add('binary');
        el.innerHTML = Math.round(Math.random()) ? '1' : '0';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = Math.random() * 3 + 2 + 's';
        el.style.opacity = Math.random() * 0.5 + 0.1;
        el.style.fontSize = Math.random() * 20 + 10 + 'px';
        el.style.color = 'rgba(0, 0, 0, 0.2)';
        
        binaryContainer.appendChild(el);
        
        // Remove the element after animation completes
        setTimeout(() => {
            el.remove();
        }, 5000);
    }
    
    // Create binary elements at intervals
    setInterval(createBinaryElement, 100);
    
    // Add CSS for binary animation
    const style = document.createElement('style');
    style.textContent = `
        .binary {
            position: absolute;
            top: -20px;
            animation: fall linear forwards;
        }
        
        @keyframes fall {
            to {
                transform: translateY(100vh);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Service cards data
    const services = [
        {
            title: 'Mobile Applications',
            description: 'Native and cross-platform mobile apps that deliver exceptional user experiences across devices.',
            icon: 'fa-solid fa-mobile-screen'
        },
        {
            title: 'Web Development',
            description: 'Responsive, high-performance websites and web applications optimized for all devices.',
            icon: 'fa-solid fa-code'
        },
        {
            title: 'Custom Software',
            description: 'Bespoke software solutions tailored to your specific business requirements and challenges.',
            icon: 'fa-solid fa-laptop-code'
        },
        {
            title: 'Cloud Architecture',
            description: 'Scalable, secure cloud infrastructure designed for performance and reliability.',
            icon: 'fa-solid fa-cloud'
        },
        {
            title: 'AI & Data Engineering',
            description: 'Advanced data analytics and machine learning solutions to drive intelligent decision-making.',
            icon: 'fa-solid fa-robot'
        },
        {
            title: 'E-Commerce',
            description: 'End-to-end digital commerce platforms with seamless payment integration and user experience.',
            icon: 'fa-solid fa-shopping-cart'
        },
        {
            title: 'FinTech Solutions',
            description: 'Secure, compliant financial technology applications built for the digital economy.',
            icon: 'fa-solid fa-chart-line'
        },
        {
            title: 'Cybersecurity',
            description: 'Comprehensive security solutions to protect your digital assets and customer data.',
            icon: 'fa-solid fa-shield-halved'
        }
    ];
    
    // Populate service cards
    const servicesGrid = document.querySelector('.services-grid');
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.classList.add('service-card');
        serviceCard.innerHTML = `
            <div class="icon"><i class="${service.icon}"></i></div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        `;
        servicesGrid.appendChild(serviceCard);
        
        // Add hover effect
        serviceCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        
        serviceCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
        });
    });
    
    // Scroll animation for sections
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: "0px"
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add animation classes and observe sections
    document.querySelectorAll('.section-header, .service-card, .feature-card, .contact-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Add CSS for scroll animations
    const scrollStyle = document.createElement('style');
    scrollStyle.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in.in-view {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(scrollStyle);
    
    // Form submission
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Here you would typically send the data to your server
        // For demonstration, we'll just show an alert
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
});
