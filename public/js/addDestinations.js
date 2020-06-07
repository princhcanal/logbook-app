let addDestinationButtons = document.querySelectorAll('button.add-destination');

addDestinationButtons.forEach(destinationButton => {
    destinationButton.addEventListener('click', e => {
        e.preventDefault();
    })
})