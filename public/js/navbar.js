let links = document.querySelectorAll(".nav-links a");

links.forEach((link) => {
	link.addEventListener("click", () => {
		links.forEach((link) => {
			link.classList.remove("link-selected");
		});
		link.classList.add("link-selected");
	});
});

let hamburgerIcon = document.querySelector(".hamburger-icon");
let icon = document.querySelector(".hamburger-icon i");
let menuIcon = document.querySelector(".menu-icon");
let hamburgerMenu = document.querySelector(".hamburger-menu");
let hamburgerMenuChildren = document.querySelectorAll(".hamburger-menu *");
let backdrop = document.querySelector(".backdrop");

hamburgerIcon.addEventListener("click", () => {
	hamburgerMenu.classList.add("show-menu");
	backdrop.classList.add("show-backdrop");
});

menuIcon.addEventListener("click", () => {
	hamburgerMenu.classList.remove("show-menu");
	backdrop.classList.remove("show-backdrop");
});

document.addEventListener("click", (e) => {
	for (let child of hamburgerMenuChildren) {
		if (e.target === child) return;
	}
	if (
		e.target !== hamburgerMenu &&
		e.target !== hamburgerIcon &&
		e.target !== icon
	) {
		hamburgerMenu.classList.remove("show-menu");
		backdrop.classList.remove("show-backdrop");
	}
});
