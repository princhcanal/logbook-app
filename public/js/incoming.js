let numIncoming = document.querySelectorAll('.row.incoming').length;
let numNotificationIncoming = document.querySelectorAll('.num-notification.incoming');

numNotificationIncoming.forEach(function (num) {
    if (numIncoming > 0) {
        num.innerHTML = numIncoming;
        num.style.display = 'block';
    }
})