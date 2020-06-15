let options = document.querySelectorAll(".login-options-group");
let texts = document.querySelectorAll(".login-options-group .text");
let forms = document.querySelectorAll(".form");

texts.forEach(function (text, i) {
	text.addEventListener("click", function () {
		options.forEach(function (option) {
			option.classList.remove("option-selected");
		});
		text.parentElement.classList.add("option-selected");

		forms.forEach(function (form) {
			form.classList.add("hide");
		});
		forms[i].classList.remove("hide");
	});
});