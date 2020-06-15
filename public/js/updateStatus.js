let approveButtons = document.querySelectorAll('.approve-btn');

approveButtons.forEach(function (approveButton) {
    approveButton.addEventListener('click', function () {
        let row = approveButton.parentElement.parentElement.parentElement;
        let deleteButton = approveButton.nextElementSibling;
        let loader = approveButton.previousElementSibling;
        let docId = row.children[0].innerHTML;
        let data = {
            docId: docId
        };

        // hide approve button
        approveButton.classList.add('hide');
        // show loader
        loader.classList.remove('hide');
        // disable delete button
        deleteButton.disabled = true;
        axios.put('/logbook', data).then(function (response) {
            setTimeout(function () {
                loader.classList.add('hide');
                row.remove();
            }, 1000);
        }).catch(function (err) {
            console.log(err);
        });
    });
});

let deleteButtons = document.querySelectorAll('.delete-btn');

deleteButtons.forEach(function (deleteButton) {
    deleteButton.addEventListener('click', function () {
        let row = deleteButton.parentElement.parentElement.parentElement;
        let approveButton = deleteButton.previousElementSibling;
        let loader = deleteButton.nextElementSibling;
        let docId = row.children[0].innerHTML;
        let data = {
            docId: docId
        }

        deleteButton.classList.add('hide');
        loader.classList.remove('hide');
        approveButton.disabled = true;
        axios.delete('/logbook', {
            headers: {},
            data: {
                docId: docId
            }
        }).then(function (response) {
            setTimeout(function () {
                loader.classList.add('hide');
                row.remove();
            }, 1000)
        }).catch(function (err) {
            console.log(err);
        })
    })
})

let processButtons = document.querySelectorAll('.process-btn');

processButtons.forEach(function (processButton) {
    processButton.addEventListener('click', function () {
        let row = processButton.parentElement.parentElement.parentElement;
        let docId = row.children[0].innerHTML;
        let sender = row.children[1].innerText;
        let receiveButton = processButton.nextElementSibling;
        let returnButton = row.children[4].children[0].children[1];
        let loader = processButton.previousElementSibling;
        let indexRows = document.querySelectorAll('.row.index');
        let statuses = [];
        let department = document.querySelector('.office-title').innerHTML;
        let statusIndices = [];

        indexRows.forEach(function (indexRow) {
            if (indexRow.children[0].innerHTML === docId) {
                let destinationsParagraphs = indexRow.children[4].children[0].children;
                for (let i = 0; i < destinationsParagraphs.length; i++) {
                    if (destinationsParagraphs[i].children[0].innerHTML === department) {
                        statusIndices.push(i);
                    }
                }
                let statusesParagraphs = indexRow.children[5].children[0].children;
                for (let i = 0; i < statusesParagraphs.length; i++) {
                    statuses.push(statusesParagraphs[i].children[0].innerHTML);
                }
            }
        });

        let data = {
            docId: docId,
            sender: sender,
            statuses: statuses,
            status: 'Processed',
            returned: !statuses.includes('FROZEN') && !statuses.includes('Received'),
            statusIndices: statusIndices
        }

        receiveButton.disabled = true;
        returnButton.disabled = true;
        processButton.classList.add('hide');
        loader.classList.remove('hide');
        axios.put('/logbook/incoming', data).then(function (response) {
            setTimeout(function () {
                loader.classList.add('hide');
                row.remove();
            }, 1000);
        });
    });
});

let receiveButtons = document.querySelectorAll('.receive-btn');

receiveButtons.forEach(function (receiveButton) {
    receiveButton.addEventListener('click', function () {
        let row = receiveButton.parentElement.parentElement.parentElement;
        let docId = row.children[0].innerHTML;
        let sender = row.children[1].innerText;
        let processButton = receiveButton.previousElementSibling;
        let returnButton = row.children[4].children[0].children[1];
        let loader = receiveButton.nextElementSibling;
        let receivedMessage = loader.nextElementSibling;
        let indexRows = document.querySelectorAll('.row.index');
        let statuses = [];
        let department = document.querySelector('.office-title').innerHTML;
        let statusIndices = [];

        indexRows.forEach(function (indexRow) {
            if (indexRow.children[0].innerHTML === docId) {
                let destinationsParagraphs = indexRow.children[4].children[0].children;
                for (let i = 0; i < destinationsParagraphs.length; i++) {
                    if (destinationsParagraphs[i].children[0].innerHTML === department) {
                        statusIndices.push(i);
                    }
                }
                let statusesParagraphs = indexRow.children[5].children[0].children;
                for (let i = 0; i < statusesParagraphs.length; i++) {
                    statuses.push(statusesParagraphs[i].children[0].innerHTML);
                }
            }
        });

        let data = {
            docId: docId,
            sender: sender,
            statuses: statuses,
            status: 'Received',
            returned: false,
            statusIndices: statusIndices
        }

        processButton.disabled = true;
        returnButton.disabled = true;
        receiveButton.classList.add('hide');
        loader.classList.remove('hide');
        axios.put('/logbook/incoming', data).then(function (response) {
            setTimeout(function () {
                loader.classList.add('hide');
                receiveButton.remove();
                processButton.remove();
                receivedMessage.classList.remove('hide');
                returnButton.disabled = false;
            }, 1000);
        }).catch(function (err) {
            console.log(err);
        });
    });
});

let returnButtons = document.querySelectorAll('.return-btn');

returnButtons.forEach(function (returnButton) {
    returnButton.addEventListener('click', function () {
        let row = returnButton.parentElement.parentElement.parentElement;
        let docId = row.children[0].innerHTML;
        let sender = row.children[1].innerText;
        let loader = returnButton.previousElementSibling;
        let indexRows = document.querySelectorAll('.row.index');
        let statuses = [];
        let department = document.querySelector('.office-title').innerHTML;
        let statusIndices = [];

        indexRows.forEach(function (indexRow) {
            if (indexRow.children[0].innerHTML === docId) {
                let destinationsParagraphs = indexRow.children[4].children[0].children;
                for (let i = 0; i < destinationsParagraphs.length; i++) {
                    if (destinationsParagraphs[i].children[0].innerHTML === department) {
                        statusIndices.push(i);
                    }
                }
                let statusesParagraphs = indexRow.children[5].children[0].children;
                for (let i = 0; i < statusesParagraphs.length; i++) {
                    statuses.push(statusesParagraphs[i].children[0].innerHTML);
                }
            }
        });

        let data = {
            docId: docId,
            sender: sender,
            statuses: statuses,
            status: 'Returned',
            returned: !statuses.includes('FROZEN') && !statuses.includes('Received'),
            statusIndices: statusIndices
        }

        loader.classList.remove('hide');
        returnButton.remove();
        axios.put('/logbook/incoming', data).then(function (response) {
            setTimeout(function () {
                row.remove();
            }, 1000)
        }).catch(function (err) {
            console.log(err);
        })
    })
})