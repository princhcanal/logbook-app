let requiredInputs = document.querySelectorAll('[required]');
let submitButtons = document.querySelectorAll('[type="submit"]');
let forms = document.querySelectorAll('form');

requiredInputs.forEach(requiredInput => {
    requiredInput.addEventListener('invalid', e => {
        let errorMessage = requiredInput.previousElementSibling;
        errorMessage.classList.add('show-invalid-input');
    });
});

forms.forEach(form => {
    form.addEventListener('submit', e => {
        if (this.checkValidity() === true) {
            console.log('valid')
        } else {
            console.log('invalid')
        }
    })
})