module.exports = {
    isToday: function (dateParameter) {
        var today = new Date();
        return dateParameter.getDate() === today.getDate() && dateParameter.getMonth() === today.getMonth() && dateParameter.getFullYear() === today.getFullYear();
    }
}