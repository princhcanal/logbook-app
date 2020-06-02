let options = document.querySelectorAll(".options-group");
let texts = document.querySelectorAll(".options-group .text");
let forms = document.querySelectorAll(".form");

texts.forEach((text, i) => {
	text.addEventListener("click", () => {
		options.forEach((option) => {
			option.classList.remove("option-selected");
		});
		text.parentElement.classList.add("option-selected");

		forms.forEach((form) => {
			form.classList.add("hide");
		});
		forms[i].classList.remove("hide");
	});
});
