let addDestinationButtons = document.querySelectorAll('button.add-destination');
let inputGroupSelects = document.querySelectorAll('.input-group-select');
let numDestinations = 1;

addDestinationButtons.forEach(destinationButton => {
    destinationButton.addEventListener('click', e => {
        e.preventDefault();
        addDestinationButtons.forEach(destinationButon => {
            destinationButon.style.display = 'none';
        })
        addDestinationButtons[numDestinations].style.display = 'block';
        inputGroupSelects[numDestinations++].style.display = 'flex';
    });
})