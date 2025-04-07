// Mobile Navigation Toggle & Current Year Setup
document.addEventListener('DOMContentLoaded', function () {
  const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
  const mobileNavMenu = document.getElementById('mobile-nav-menu');
  
  mobileNavToggle.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true' || false;
    this.setAttribute('aria-expanded', !expanded);
    mobileNavMenu.style.display = expanded ? 'none' : 'block';
  });
  
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
});
