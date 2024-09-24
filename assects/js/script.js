// Handle dynamic form validation and submission for the registration page
document.addEventListener('DOMContentLoaded', () => {
    const roleSelector = document.querySelector('#role');
    const additionalFields = document.querySelector('#additional-fields');

    // Show/Hide fields based on role selection
    if (roleSelector) {
        roleSelector.addEventListener('change', () => {
            if (roleSelector.value === 'seller') {
                additionalFields.innerHTML = `<label>Property Details:</label>
                                              <input type="text" name="propertyDetails" required>`;
            } else if (roleSelector.value === 'buyer') {
                additionalFields.innerHTML = `<label>Preferences (Location, Budget):</label>
                                              <input type="text" name="preferences" required>`;
            } else {
                additionalFields.innerHTML = '';
            }
        });
    }

    // Handle form submission with AJAX (simulate)
    const registrationForm = document.querySelector('#registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            alert("Form submitted successfully!");
            // Use AJAX to send form data to server here
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const gallery = document.querySelector('.gallery');
    const images = gallery.querySelectorAll('img');
    const totalImages = images.length;
    let currentIndex = 0;
    
    function showNextImage() {
        currentIndex = (currentIndex + 1) % totalImages;
        const offset = -currentIndex * 100; // Calculate the offset based on the current index
        gallery.style.transform = `translateX(${offset}%)`;
    }
    
    setInterval(showNextImage, 2000); // Change image every second
});
// script.js

const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Initialize theme based on localStorage
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
}

/* Update Toggle Button Appearance on Page Load */
function updateToggleButton() {
    if (body.classList.contains('dark-mode')) {
        toggleButton.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
        toggleButton.setAttribute('aria-label', 'Switch to Dark Mode');
    }
}

// Initial button state
updateToggleButton();

// Toggle Theme on Button Click
toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Save the user's preference in localStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
    
    // Update button label
    updateToggleButton();
});

