const dates = {};

dates.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

dates.addDays = function (date, days) {
    date.setDate(date.getDate() + days);
    return date;
}

dates.createDateString = function (date = new Date(), format = ',', daysAdded = 0) {
    date = dates.addDays(date, daysAdded);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let datesArray = [month, day, year];

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;

    let dateString;

    if (format === ',') {
        dateString = `${dates.months[month - 1]} ${day}, ${year}`;
    } else if (format === 'id') {
        dateString = `${month}${day}${year}`;
    } else {
        dateString = datesArray.join(format);
    }

    return dateString;
}

dates.getMeridian = function (hour = new Date().getHours()) {
    return hour > 12 ? 'pm' : 'am';
}

dates.get12Hour = function (hour = new Date().getHours()) {
    return hour === 0 ? 12 :
        hour > 12 ? hour - 12 :
        hour;
}

dates.get12HourWithMeridian = function (hour = new Date().getHours()) {
    return dates.get12Hour(hour) + dates.getMeridian(hour);
}

module.exports = dates;