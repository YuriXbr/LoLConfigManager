const chalk = require('chalk');
const arrow = chalk.bold.cyan('LOG -> ')
const alerta = chalk.yellowBright.bold;
const verde = chalk.greenBright;
const verdebold = chalk.greenBright.bold;
const error = chalk.redBright.bold('[ERROR] ');
const vermelho = chalk.red.bold;
const playererror = chalk.redBright.bold('[PLAYER ERROR]: ');
const playerlog = chalk.cyanBright.bold('[PLAYER LOG]: ')
const playeralert = chalk.yellow.bold('[PLAYER ALERT:]: ')
const bold = chalk.bold;
const italic = chalk.italic

const LIGHTGREEN  = 0x4dff7c;
const GREEN       = 0x00c935;
const DARKGREEN   = 0x056300;

const LIGHTRED    = 0xff5757;
const RED         = 0xff3636;
const DARKRED     = 0x631414;

const LIGHTCYAN   = 0x2ef8ff;
const CYAN        = 0x00b9bf;
const DARKCYAN    = 0x168d91;

const LIGHTBLUE   = 0x5286ff;
const BLUE        = 0x0026ff;
const DARKBLUE    = 0x011063;

const LIGHTPINK   = 0xff78f8;
const PINK        = 0xd900ce;
const DARKPINK    = 0x91008a;

const LIGHTORANGE = 0xffb13d;
const ORANGE      = 0xff9800;
const DARKORANGE  = 0xad6700;

const LIGHTYELLOW = 0xffff7d;
const YELLOW      = 0xffff00;
const DARKYELLOW  = 0x9c9c00;

const LIGHTLEMON  = 0xdbff57;
const LEMON       = 0xc8ff00;
const DARKLEMON   = 0x80a300;

const LIGHTPURPLE = 0xc252ff;
const PURPLE      = 0xa600ff;
const DARKPURPLE  = 0x4b106b;

const GOLD        = 0xbf930d;
const WINE        = 0x8f1d4a;

module.exports = {
    chalk,
    error,
    vermelho,
    arrow,
    alerta,
    playererror,
    playeralert,
    playerlog,
    verde,
    verdebold,
    bold,
    italic,

    LIGHTGREEN,
    GREEN,
    DARKGREEN,
    LIGHTRED,
    RED,
    DARKRED,
    LIGHTCYAN,
    CYAN,
    DARKCYAN,
    LIGHTBLUE,
    BLUE,
    DARKBLUE,
    LIGHTPINK,
    PINK,
    DARKPINK,
    LIGHTORANGE,
    ORANGE,
    DARKORANGE,
    LIGHTYELLOW,
    YELLOW,
    DARKYELLOW,
    LIGHTLEMON,
    LEMON,
    DARKLEMON,
    LIGHTPURPLE,
    PURPLE,
    DARKPURPLE,
    GOLD,
    WINE
};