let logList = document.querySelector('ul.log');
let logs = logList.children;
let seeMore = document.querySelector('.see-more');

for (let i = logs.length - 1; i >= logs.length - 10; i--) {
    logs[i].style.display = 'block';
}

seeMore.addEventListener('click', () => {
    if (seeMore.innerHTML === 'See More') {
        for (let i = 0; i < logs.length - 10; i++) {
            logs[i].style.display = 'block';
        }
        seeMore.innerHTML = 'See Less';
    } else {
        for (let i = 0; i < logs.length - 10; i++) {
            logs[i].style.display = 'none';
        }
        seeMore.innerHTML = 'See More';
    }
})