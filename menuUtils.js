const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');
const fs = require('fs');
const { updateInfoFile } = require('./fileUtils');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question, options = []) {
  return new Promise((resolve) => {
    if (options.length > 0) {
      options.forEach((option, index) => {
        console.log(`[${index + 1}] ${option}`);
      });
    }
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function showMenu(info, infoFilePath) {
  process.stdout.write('\x1Bc');
  console.log(chalk.green(figlet.textSync('ConfigManager', { horizontalLayout: 'full' })));
  console.log(`
  Funcionalidades:
  [1] Alternar trava de configurações   (Atualmente: ${info.ConfigLocked ? 'travadas' : 'destravadas'})
  `);
  console.log(info.outputMessage || '\nSem comandos anteriores');
  const option = await askQuestion('\n ________________________________________________________________\n » Por favor, digite o número da opção que deseja selecionar: ');

  processMenuOption(option, info, infoFilePath);
}

function processMenuOption(option, info, infoFilePath) {
  switch (option) {
    case '1':
      toggleConfigLock(info, infoFilePath);
      break;
    default:
      info.outputMessage = '\nOpção inválida! Por favor, selecione uma opção válida.';
      showMenu(info, infoFilePath);
      break;
  }
}

function toggleConfigLock(info, infoFilePath) {
  if (info.ConfigLocked) {
    unlockConfig(info, infoFilePath);
  } else {
    lockConfig(info, infoFilePath);
  }
}

function lockConfig(info, infoFilePath) {
  if (info.ConfigLocked) {
    info.outputMessage = '\nAs configurações já estão travadas!';
    showMenu(info, infoFilePath);
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0444');
      info.ConfigLocked = true;
      info.outputMessage = '\nTrava de configurações ativada. As configurações estão agora travadas.';
      updateInfoFile(info, infoFilePath);
      showMenu(info, infoFilePath);
    } catch (error) {
      console.error('[ERRO]: Ocorreu um erro ao travar as configurações.', error);
    }
  }
}

function unlockConfig(info, infoFilePath) {
  if (!info.ConfigLocked) {
    info.outputMessage = '\nAs configurações já estão destravadas!';
    showMenu(info, infoFilePath);
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0666');
      info.ConfigLocked = false;
      info.outputMessage = '\nTrava de configurações desativada. As configurações estão agora destravadas.';
      updateInfoFile(info, infoFilePath);
      showMenu(info, infoFilePath);
    } catch (error) {
      console.error('[ERRO]: Ocorreu um erro ao destravar as configurações.', error);
    }
  }
}

module.exports = {
  showMenu,
};
