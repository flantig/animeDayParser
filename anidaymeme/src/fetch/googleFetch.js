const sharedFunc = require("../../../sharedFunc");

module.exports = {
    getGoogle: async (monthDay) => {
        const data = sharedFunc.getGoogle(monthDay)
        return data;
    }
}