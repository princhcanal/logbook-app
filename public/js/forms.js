let requiredInputs = document.querySelectorAll('[required]');
let submitButtons = document.querySelectorAll('[type="submit"]');
let forms = document.querySelectorAll('form');

requiredInputs.forEach(function (requiredInput) {
    requiredInput.addEventListener('invalid', function (e) {
        let errorMessage = requiredInput.previousElementSibling;
        errorMessage.classList.add('show-invalid-input');
    });
});