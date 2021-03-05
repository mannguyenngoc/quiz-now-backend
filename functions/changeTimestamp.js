function changeTimestamp(timestamp) {
    const date = timestamp.getDate();
    const month = timestamp.getMonth();
    const year = timestamp.getFullYear();

    const result = new Date(year, month, date)
    return Date.parse(result);
}
module.exports = changeTimestamp;
