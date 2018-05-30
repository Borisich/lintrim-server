class utils {
    static getUniqueString(){

        let time = new Date().getTime().toString();
        let timeString = '';
        for (let i=0; i < time.length; i++){
            timeString += String.fromCharCode(97 + parseInt(time[i]))
        }


        let addRandomText = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 40; i++)
            addRandomText += possible.charAt(Math.floor(Math.random() * possible.length));

        return timeString + addRandomText;
    }
}

module.exports = utils;