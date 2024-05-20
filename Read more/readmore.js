/*==================== scroll reveal ====================*/
ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000 ,
    delay: 200
    
});

ScrollReveal().reveal('.about-content',{ origin:'bottom' });

// ScrollReveal().reveal('section',{ origin:'right' });

ScrollReveal().reveal('.section-title',{ origin:'top' });

window.addEventListener('DOMContentLoaded', function() {
    var fadeElements = document.querySelectorAll('.section');
        
    function fadeInElements() {
        for (var i = 0; i < fadeElements.length; i++) {
            var element = fadeElements[i];
            var elementPosition = element.getBoundingClientRect().top;
            var windowHeight = window.innerHeight;

            if (elementPosition < windowHeight) {
                element.classList.add('fade-in');
            }
        }
    }
    
    window.addEventListener('scroll', fadeInElements);
    fadeInElements();
});

/*==================== courser js ====================*/