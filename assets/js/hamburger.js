const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
        const expanded = hamburger.getAttribute("aria-expanded") === "true";
        hamburger.setAttribute("aria-expanded", String(!expanded));
        hamburger.setAttribute("aria-label", expanded ? "Avaa valikko" : "Sulje valikko");
        hamburger.classList.toggle("active", !expanded);
        navLinks.classList.toggle("active", !expanded);
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.setAttribute("aria-label", "Avaa valikko");
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        }
    });
}