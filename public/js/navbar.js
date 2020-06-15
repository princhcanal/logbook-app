let links = document.querySelectorAll(".nav-links a");

links.forEach(function (link) {
	link.addEventListener("click", function () {
		links.forEach(function (link) {
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

hamburgerIcon.addEventListener("click", function () {
	hamburgerMenu.classList.add("show-menu");
	backdrop.classList.add("show-backdrop");
});

menuIcon.addEventListener("click", function () {
	hamburgerMenu.classList.remove("show-menu");
	backdrop.classList.remove("show-backdrop");
});

document.addEventListener("click", function (e) {
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