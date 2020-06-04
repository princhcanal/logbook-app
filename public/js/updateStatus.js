let approveButtons = document.querySelectorAll('.approve-btn');

approveButtons.forEach(approveButton => {
    approveButton.addEventListener('click', () => {
        let row = approveButton.parentElement.parentElement.parentElement;
        let deleteButton = approveButton.nextElementSibling;
        let loader = approveButton.previousElementSibling;
        let docId = row.children[0].innerHTML;
        let data = {
            docId: docId,
            approved: true
        };

        // hide approve button
        approveButton.classList.add('hide');
        // show loader
        loader.classList.remove('hide');
        // disable delete button
        deleteButton.disabled = true;
        axios.put('/logbook', data).then((response) => {
            setTimeout(() => {
                loader.classList.add('hide');
                row.remove();
            }, 1000);
        }).catch((err) => {
            console.log(err);
        });
    });
});

let deleteButtons = document.querySelectorAll('.delete-btn');

deleteButtons.forEach(deleteButton => {
    deleteButton.addEventListener('click', () => {
        let row = deleteButton.parentElement.parentElement.parentElement;
        let approveButton = deleteButton.previousElementSibling;
        let loader = deleteButton.nextElementSibling;
        let docId = row.children[0].innerHTML;
        let data = {
            docId: docId
        }
        console.log(docId)

        deleteButton.classList.add('hide');
        loader.classList.remove('hide');
        approveButton.disabled = true;
        axios.delete('/logbook', {
            headers: {},
            data: {
                docId: docId
            }
        }).then(response => {
            console.log(response)
            setTimeout(() => {
                loader.classList.add('hide');
                row.remove();
            }, 1000)
        }).catch(err => {
            console.log(err);
        })
    })
})

let processButtons = document.querySelectorAll('.process-btn');