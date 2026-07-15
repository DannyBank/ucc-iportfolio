async function loadPage(page) {

    const main = document.querySelector(".main");

    try {

        const response = await fetch(`pages/${page}.html`, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`${page} not found`);
        }

        const html = await response.text();

        main.innerHTML = html;

        // Update active menu
        document.querySelectorAll(".navmenu a")
            .forEach(link => {
                link.classList.remove("active");

                if (link.dataset.page === page) {
                    link.classList.add("active");
                }
            });


        // Reinitialize Bootstrap animations if needed
        if (typeof AOS !== "undefined") {
            AOS.refresh();
        }

        // Reinitialize typed.js if the newly loaded page contains a .typed element
        // (main.js only runs its init once on the very first load, before any
        // page content exists inside <main>, so it must be re-triggered here)
        if (typeof window.initTyped === "function") {
            window.initTyped();
        }

        // Same story for the skills progress bars (About Me page): re-attach
        // the Waypoint handler that copies aria-valuenow into the CSS width.
        if (typeof window.initSkillsAnimation === "function") {
            window.initSkillsAnimation();
        }

        // Set up validation + EmailJS submission on the Contact page's form.
        if (typeof window.initContactForm === "function") {
            window.initContactForm();
        }

        // Crossfade the navbar background to this page's gradient.
        if (typeof window.updateNavGradient === "function") {
            window.updateNavGradient(page);
        }

    } catch(error) {

        console.error(error);

        main.innerHTML = `
            <h2>
                Page could not be loaded
            </h2>
        `;
    }
}


document.addEventListener("DOMContentLoaded", () => {

    // Load home initially
    loadPage("home");

    // Handle menu clicks
    document.querySelectorAll(".navmenu a")
        .forEach(link => {

            link.addEventListener("click", function(e) {

                e.preventDefault();

                const page = this.dataset.page;

                if(page) {
                    loadPage(page);
                }

            });

        });

});