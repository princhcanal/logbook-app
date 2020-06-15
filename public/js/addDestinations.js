let addDestinationButtons = document.querySelectorAll('button.add-destination');
let inputGroupSelects = document.querySelectorAll('.input-group-select');
let numDestinations = 1;

addDestinationButtons.forEach(function (destinationButton) {
    destinationButton.addEventListener('click', function (e) {
        e.preventDefault();
        addDestinationButtons.forEach(function (destinationButon) {
            destinationButon.style.display = 'none';
        })
        addDestinationButtons[numDestinations].style.display = 'block';
        inputGroupSelects[numDestinations++].style.display = 'flex';
    });
})