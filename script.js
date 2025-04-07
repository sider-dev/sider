document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Navigation Toggle ---
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a'); // Select links from both navs

    if (mobileNavToggle && mobileNavMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            mobileNavMenu.classList.toggle('is-active');
            // Optional: Toggle body class to prevent scrolling when menu is open
            // document.body.classList.toggle('mobile-nav-open');
        });

        // Close mobile menu when a link is clicked
        const mobileNavLinks = mobileNavMenu.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavMenu.classList.remove('is-active');
                mobileNavToggle.setAttribute('aria-expanded', 'false');
                 // document.body.classList.remove('mobile-nav-open');
            });
        });
    }


    // --- Sticky Header ---
    const header = document.getElementById('site-header');
    const stickyOffset = 50; // Pixels scrolled before header becomes sticky

    function handleScroll() {
        if (window.scrollY > stickyOffset) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    }

    if (header) {
        window.addEventListener('scroll', handleScroll);
    }

    // --- Active Navigation Link on Click (Simple Version) ---
    function setActiveLink(clickedLink) {
        // Remove 'active' class from all nav links
        navLinks.forEach(link => link.classList.remove('active'));

        // Add 'active' class to the clicked link
        if (clickedLink) {
           clickedLink.classList.add('active');

           // Also activate corresponding link in the *other* nav (desktop/mobile)
           const targetHref = clickedLink.getAttribute('href');
           navLinks.forEach(link => {
               if (link !== clickedLink && link.getAttribute('href') === targetHref) {
                   link.classList.add('active');
               }
           });
        }
    }

    // Add click listener to all nav links
    navLinks.forEach(link => {
        // Only add listener to internal links
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', (e) => {
                // If it's a real internal link, prevent default jump and scroll smoothly
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if(targetElement) {
                    e.preventDefault(); // Prevent default only if target exists
                     setActiveLink(link); // Set active state on click
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

     // --- Set Active Link Based on Scroll (More Complex - Optional Enhancement) ---
     // You could use IntersectionObserver here for better performance,
     // but this simple scroll check works for basic cases.
     function setActiveLinkOnScroll() {
         let currentSection = null;
         const sections = document.querySelectorAll('main section[id]'); // Select sections with IDs in main

         sections.forEach(section => {
             const sectionTop = section.offsetTop - header.offsetHeight - 50; // Adjust offset
             const sectionBottom = sectionTop + section.offsetHeight;

             if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                 currentSection = section.id;
             }
         });

         // If near the top, activate 'Home' or the first link
         if (window.scrollY < sections[0].offsetTop - header.offsetHeight - 50) {
              currentSection = sections[0].id; // Or explicitly '#hero'
         }

         navLinks.forEach(link => {
             link.classList.remove('active');
             // Check if the link's href matches the current section ID
             if (link.getAttribute('href') === `#${currentSection}`) {
                 link.classList.add('active');
             }
         });
     }

     // Add scroll listener for active link highlighting
     window.addEventListener('scroll', setActiveLinkOnScroll);
     // Initial check on load
     setActiveLinkOnScroll();


    // --- Update Footer Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Contact Form Placeholder ---
    const contactForm = document.querySelector('.contact-form');
    if(contactForm && contactForm.getAttribute('action') === 'YOUR_FORM_ENDPOINT') {
        contactForm.addEventListener('submit', (e) => {
            // Prevent actual submission if endpoint isn't set
            e.preventDefault();
            alert('Form submission is not configured. Please set up a form endpoint.');
        });
    }

}); // End DOMContentLoaded
