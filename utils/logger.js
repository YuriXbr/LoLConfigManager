const c = require('./colorcodes.js');

const fs = require('fs');
var today = new Date();
var data = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear() + ' ' + today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
var filename = `${today.getDay()}` + '-' + `${today.getMonth()}` + ` ${today.getHours()}`+ '-'+ `${today.getMinutes()} log`



fs.writeFile(`./logs/${filename}.txt`,
 `LOG - ${data}\n=============================\n\n`,
  function (err) { if (err) throw err; });

var logger = fs.createWriteStream(`./logs/${filename}.txt`, {
    flags: 'a'
})




/**
 * @param {string} text Text to log
 */
function write(text){
    logger.write(text + `\n`);
    console.log(c.arrow + c.alerta(text));
    return;
}

function writeConsole(text){
    console.log(c.arrow + c.alerta(text));
    return;
}

/**
 * @param {string} text Text to log
 */
function writeDate(text){
    logger.write(`${data} `+ text + `\n`);
    console.log(c.arrow + c.alerta(text));
    return;
}

/**
 * @param {string} text Text to log
 */
function writeSilent(text){
    logger.write(text + `\n`);
    return;
}

/**
 * @param {string} text Text to log
 */
function writeDateSilent(text){
    logger.write(`${data} `+ text + `\n`);
    return;
}

/**
 * @param {string} text Text to log
 */
function writeInfo(text){
    logger.write(`${data} INFO: `+ text + `\n`);
    console.log(c.arrow + c.alerta(text));
    return;
}

/**
 * @param {string} text Text to log
 */
 function writeLoad(text){
    logger.write(`${data} LOAD: `+ text + `\n`);
    console.log(c.arrow + c.alerta(text));
    return;
}

/**
 * @param {string} trigger What event triggered the error
 * @param {string} errorchannel Channel name who triggered the error
 * @param {string} errormessage Error message
 * @param {any} error Error code
 */
function writeError(trigger, errorchannel, errormessage, error){
    logger.write(`<<---------------- NEW ERROR ----------------->>\n`);
    logger.write(`>> ERROR TRIGGER:  ${trigger}\n`);
    logger.write(`>> ERROR MESSAGE:  ${errormessage}\n`);
    logger.write(`>> ERROR GENERAL:  ${error}\n`)
    logger.write(`\n`)
    console.log(c.error + c.verdebold(`${error}  \n   `)+c.vermelho(">>>")+c.verdebold(`ERRO EM: ${trigger}  -- ${errormessage}`));

    return;
}

/**
 * @param {number} number Number of Blank spaces
 */
function blank(number){
    nn = 0;
    while(nn < number) {
        logger.write(`\n`);
        console.log('');
        nn++
    }
    return;
}

function blankConsole(number){
    nn = 0;
    while(nn < number) {
        console.log('');
        nn++
    }
    return;
}
module.exports = {
    filename,
    write,
    writeConsole,
    writeDate,
    writeDateSilent,
    writeSilent,
    writeError,
    writeInfo,
    writeLoad,
    blank,
    blankConsole
}
