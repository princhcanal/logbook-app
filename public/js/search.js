let searchInput = document.querySelector('.search-input');

searchInput.addEventListener('keyup', function () {
    let filter = searchInput.value.toUpperCase();
    let columns = document.querySelectorAll('.inner-column');
    let rows = document.querySelectorAll('.inner-row');
    let rowsToDisplay = [];
    columns.forEach(function (column) {
        let row = column.parentElement;
        let textValue = column.textContent || column.innerText;
        let index = textValue.toUpperCase().indexOf(filter);
        if (index > -1) {
            rowsToDisplay.push(row);
            // let highlightedText = textValue.substring(0, index) + '<span class="highlight">' + textValue.substring(index, index + textValue.length) + '</span>' + textValue.substring(index + textValue.length);
            // column.textContent = highlightedText;
            // column.innerText = highlightedText;
        }
    });
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
    for (let i = 0; i < rowsToDisplay.length; i++) {
        rowsToDisplay[i].style.display = '';
    }
})