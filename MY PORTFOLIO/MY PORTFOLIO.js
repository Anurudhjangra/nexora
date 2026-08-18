document.addEventListener('DOMContentLoaded', function() {

    // Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });

    // Typed.js Initialization
    if (document.querySelector('#element')) {
        var typed = new Typed('#element', {
            strings: ['Student', 'Graphic Designer', 'Web Developer', 'Video Editor'],
            typeSpeed: 80,
            backSpeed: 50,
            loop: true
        });
    }

    // AOS (Animate on Scroll) Initialization
    AOS.init({
        duration: 1000, // values from 0 to 3000, with step 50ms
        once: true,     // whether animation should happen only once - while scrolling down
    });

});



/*
<tr>
                                        <td><a href="NETFLIX CLONE PAGE 1.html">Netflix</a></td>
                                        <td><a href="PRIME VIDEO PAGE 1.html">Prime Video</a></td>
                                        <td><a href="About Coding.html">About Coding</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="WIX PAGE 1.html">WIX</a></td>
                                        <td><a href="PLAY STATION PAGE 1.html">Play Station</a></td>
                                    </tr>
                                     </table>
                                   */