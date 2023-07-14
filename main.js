const fs = require('fs');
const { writeFile } = require('fs').promises;
const { execSync, spawn, exec } = require('child_process');
const readline = require('readline');
const figlet = require('figlet');
const path = require('path');
const chalk = require('chalk');
const configFolderPath = 'C:/ConfigManager';
const infoFilePath = 'C:/ConfigManager/info.json';
const package = require('./package.json');
const log = require('./utils/logger');
const _locales = require('./utils/messages')
const fetch = require('node-fetch');
let outputMessage = '';
let _lang = Intl.DateTimeFormat().resolvedOptions().locale;

if(_lang = "pt-BR") locale = _locales.ptBR; else locale = _locales.enUS

process.on("unhandledRejection", e => { 
  console.clear()
  log.writeError('unhandledRejection',`INTERNAL`, e, Error)
 }) 
process.on("uncaughtException", e => { 
  console.clear()
  log.writeError('uncaughtException',`INTERNAL`, e, Error)
 })  
process.on("uncaughtExceptionMonitor", e => { 
  console.clear()
  log.writeError('uncaughtExceptionMonitor',`INTERNAL`, e, Error)
 })

exec('node -v', (error, stdout, stderr) => {
  if (error || stderr) {
    return console.log(locale.nodeNotExist);
  } 
});

async function checkLatestVersion() {
  try {
    const response = await fetch(`https://api.github.com/repos/YuriXbr/LoLConfigManager/releases/latest`);
    if (response.ok) {
      const data = await response.json();
      let latestVersion = data.tag_name;
      const currentVersion = package.version; // Substitua pela sua versão atual
      console.log(latestVersion  + currentVersion);
      if (latestVersion !== currentVersion) {
        isUpdated = false;
      } else {
        isUpdated = true;
      }
    } else {
      outputMessage = 'Não foi possível obter as informações do repositório.';
    }
  } catch (error) {
    outputMessage = 'Ocorreu um erro ao verificar a versão, verifique os logs';
    log.writeError('checkLatestVersion',`INTERNAL`, e, Error)
  }
  return isUpdated, outputMessage;
}




// Verifica se a pasta ConfigManager existe, senão cria
if (!fs.existsSync(configFolderPath)) {
  fs.mkdirSync(configFolderPath);
}

// Verifica se o arquivo info.json existe e está vazio, senão cria ou reconstrói a estrutura inicial
if (!fs.existsSync(infoFilePath) || fs.readFileSync(infoFilePath, 'utf8').trim() === '') {
  const initialInfo = {
    LeaguePath: 'C:\\Riot Games\\League of Legends\\Config',
    ConfigLocked: false,
    Mastery: 0,
  };
  fs.writeFileSync(infoFilePath, JSON.stringify(initialInfo));
}

// Carrega as informações do arquivo info.json
let info = JSON.parse(fs.readFileSync(infoFilePath, 'utf8'));
log.writeSilent(locale.loadedInfo + JSON.stringify(info))

// Cria a interface de leitura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function findPersistedSettings() {
  const configPath = info.LeaguePath
  const configFiles = await fs.promises.readdir(configPath);

  const persistedSettingsFile = configFiles.find(file => file.toLowerCase() === 'persistedsettings.json');

  if (persistedSettingsFile) {
    return path.join(configPath, persistedSettingsFile);
  } else {
    throw new Error(locale.configFileNotFound);
  }
}
// Função para fazer uma pergunta ao usuário
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


// Função para exibir o menu e processar a opção selecionada
async function showMenu() {
  process.stdout.write('\x1Bc');
  await checkLatestVersion();


  console.log(chalk.green.bold(figlet.textSync(locale.appName, { horizontalLayout: 'full' })));

  if (!info.LeaguePath) {
    const leaguePath = await askQuestion(locale.missingLeaguePathConfig);
    if (leaguePath) {
      info.LeaguePath = leaguePath.trim();
      updateInfoFile();
    } else {
      outputMessage = (chalk.redBright(locale.invalidLeaguePathDir));
      showMenu();
      return;
    }
  }
  

  console.log(locale.notAffiliated);
  console.log(chalk.yellow.bold(`  App Version: `+ `${isUpdated ? chalk.greenBright.bold(locale.updatedVersion + ` (${package.version})`) : chalk.redBright.bold(locale.newVersion)}`));
  console.log(locale.functions);

  console.log(chalk.greenBright.bold(locale.menuOp0 + `${info.LeaguePath ? chalk.yellowBright(info.LeaguePath) : chalk.redBright.bold(locale.menuNotConfigured)})`));
  console.log(chalk.greenBright.bold(locale.menuOp1 + `${info.ConfigLocked ? chalk.redBright(locale.menuLocked) : chalk.blueBright(locale.menuUnlocked)})`));
  console.log(chalk.greenBright.bold(locale.menuOp2));
  console.log(chalk.greenBright.bold(locale.menuOp3));
  console.log(chalk.greenBright.bold(locale.menuOp4));
  console.log(chalk.redBright.bold(locale.menuOp5));
  console.log(chalk.yellow(locale.menuOpX));
  console.log(chalk.yellow(locale.menuOpC))
  console.log(chalk.cyanBright(locale.menuOutput))
  await console.log(outputMessage || locale.menuNoCommands);

  const option = await askQuestion('\n ________________________________________________________________\n'+locale.askQuestionSelectAOption);

  if (option.toUpperCase() === 'X') {
    await reconfigureOptions();
  } else {
    processMenuOption(option);
  }
}


async function reconfigureOptions() {
  console.clear();
  const fieldOptions = [
    { field: 'LeaguePath', description:  locale.reconfigureOptionsConfigPath},
    { field: 'ConfigLocked', description: locale.reconfigureOptionsConfigLocked},
  ];

  info.Mastery = 0;
  const persistedSettingsPath = await findPersistedSettings();

  const persistedSettingsData = await fs.promises.readFile(persistedSettingsPath, 'utf-8');
  const persistedSettings = JSON.parse(persistedSettingsData);
  const gameEventsSection = persistedSettings.files.find(file => file.name === 'Input.ini').sections.find(section => section.name === 'GameEvents');

  console.log(chalk.yellow.bold(locale.reconfigureOptionsLabel));
  const filteredMasteryEmote = gameEventsSection.settings.filter(setting => {
    return setting.name.includes("evtRadialEmotePlaySlot") && setting.value.includes("[r]");
  });
  filteredMasteryEmote.forEach(setting => {
    info.Mastery = 2;
  });

  const filteredMasteryUlt = gameEventsSection.settings.filter(setting => {
    return setting.name.includes("evtChampMasteryDisplay") && setting.value.includes("[r]");
  });
  filteredMasteryUlt.forEach(setting => {
    info.Mastery = 1;
  });

if (info.Mastery == 0) _m = locale.infoMasteryNone;
if (info.Mastery == 1) _m = locale.infoMasteryUltimate
if (info.Mastery == 2) _m = locale.infoMasteryEmote
  data = [ 
    {LoLPath: `${info.LeaguePath}`},
    {Locked:  info.ConfigLocked},
    {Mastery: `${_m}`}
  ]
  console.table(data)

  fieldOptions.forEach((option, index) => {
    console.log(`[${index + 1}] ${option.description}`);
  });
  console.log(`[${fieldOptions.length + 1}] `+ locale.cancel);
  console.log(chalk.redBright.bold(locale.redWarning))
  console.log(chalk.blueBright.bold(locale.blueWarning));

  const option = await askQuestion(locale.reconfigureOptionsQuestion);

  const selectedIndex = parseInt(option) - 1;
  if (selectedIndex >= 0 && selectedIndex < fieldOptions.length) {
    const selectedOption = fieldOptions[selectedIndex];
    let newValue;

     if (selectedOption.field === 'ConfigLocked') {
      const lockOption = await askQuestion(locale.reconfigureOptionsNewValueConfigLocked);
      newValue = lockOption.trim().toLowerCase() === 'true';
      toggleConfigLock(newValue); // Chama a função toggleConfigLock() passando o novo valor como argumento
    } else {
      newValue = await askQuestion(`${locale.reconfigureOptionsNewValueTo} "${selectedOption.description}": `);
    }

    info[selectedOption.field] = newValue;
    outputMessage = (`${locale.reconfigureOptionsOption} "${selectedOption.description}" ${locale.reconfigureOptionsSuccess}`);
    updateInfoFile();
  } else if (selectedIndex === fieldOptions.length) {
    outputMessage = (locale.reconfigureOptionsCancel);
  } else {
    outputMessage = (locale.invalidOption);
  }

  showMenu();
}



// Função para processar a opção selecionada no menu
async function processMenuOption(option) {
  switch (option) {
    case '0':
      openLeaguePath();
      break;
    case '1':
      toggleConfigLock();
      showMenu();
      break;
    case '2':
      resetUX();
      showMenu();
      break;
    case '3':
      configureMastery();
      break;
    case '4':
      lowerPriority();
      break;
    default:
      outputMessage = (locale.invalidOption);
      showMenu();
      break;
  }
}

// Função para abrir a pasta do LeaguePath no explorador de arquivos do usuário

async function lowerPriority() {
        console.log(chalk.yellow.bold('\nPrioridade do processo:'));
        console.log('  [1] Tempo real      (Mais alto)');
        console.log('  [2] Alto            (Alto)');
        console.log('  [3] Acima do normal');
        console.log(`  [4] NORMAL          (Padrão)`);
        console.log(`  [5] Abaixo do normal`);
        console.log(`  [6] Baixo           (Menor possivel)`);
        console.log(` [7/X] Sair`);

        const priority = await askQuestion('\n » Por favor, digite o número da opção de prioridade: ');
        if (priority.toLowerCase() == 'x') return showMenu();
        const selectedPriority = parseInt(priority) - 1;
        if(selectedPriority == 6) return showMenu();

        if(selectedPriority == 0) {
          outputMessage = (`Processo do LeagueUxRender colocado em tempo real.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 256`);
          showMenu();
          return;
        } else if(selectedPriority == 1) {
          outputMessage = (`Processo do LeagueUxRender colocado em Alto.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 128`);
          showMenu();
          return;
        } else if(selectedPriority == 2) {
          outputMessage = (`Processo do LeagueUxRender colocado em Acima do normal.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 32768`);
          showMenu();
          return;
        } else if(selectedPriority == 3) {
          outputMessage = (`Processo do LeagueUxRender de volta a prioridade normal.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 32`);
          showMenu();
          return;
        } else if(selectedPriority == 4) {
          outputMessage = (`Processo do LeagueUxRender colocado abaixo do normal.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 16384`);
          showMenu();
          return;
        } else if(selectedPriority == 5) {
          outputMessage = (`Processo do LeagueUxRender colocado em baixa prioridade`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 64`);
          showMenu();
          return;
        } else {
          outputMessage = ('Opção inválida! Por favor, selecione uma opção válida.');
          showMenu();
        }
}


function openLeaguePath() {
  if (info.LeaguePath) {
    const leaguePath = path.resolve(info.LeaguePath);

    let command;
    if (process.platform === 'win32') {
      command = `explorer "${leaguePath}"`;
    } else if (process.platform === 'darwin') {
      command = `open "${leaguePath}"`;
    } else {
      command = `xdg-open "${leaguePath}"`;
    }

    try {
      const { exec } = require('child_process');
      exec(command);
      outputMessage = (`Pasta do LeaguePath aberta com sucesso!`);
    } catch (error) {
      outputMessage = (chalk.redBright(`[ERROR] Ocorreu um erro ao abrir a pasta do LeaguePath: ${error.message}`));
    }
    showMenu();
  } else {
    outputMessage = (chalk.yellowBright.bold('[ALERTA] O LeaguePath ainda não está configurado! Por favor, configure-o primeiro.'));
    showMenu();
  }
}


// Função para alternar a trava de configurações
function toggleConfigLock() {
  if (info.ConfigLocked) {
    unlockConfig();
  } else {
    lockConfig();
  }
}


// Função para travar as configurações
function lockConfig() {
  if (info.ConfigLocked) {
    outputMessage = ('As configurações já estão travadas!');
    showMenu();
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0444');
      info.ConfigLocked = true;
      outputMessage = ('Trava de configurações ativa. As configurações foram destravadas com sucesso!');
      updateInfoFile();
    } catch (error) {
      outputMessage = (chalk.redBright(`[ERROR] Ocorreu um erro ao travar as configurações: ${error}`));
    } finally {
      showMenu();
    }
  }
}

// Função para destravar as configurações
function unlockConfig() {
  if (!info.ConfigLocked) {
    outputMessage = ('As configurações já estão destravadas!');
    showMenu();
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0666');
      info.ConfigLocked = false;
      outputMessage = ('Trava de configurações desativada. As configurações foram destravadas com sucesso!');
      updateInfoFile();
    } catch (error) {
      outputMessage = (chalk.redBright(`[ERROR] Ocorreu um erro ao destravar as configurações: ${error}`));
    } finally {
      showMenu();
    }
  }
}

// Função para reiniciar os processos relacionados ao League of Legends
function resetUX() {
  outputMessage = ('Reiniciando interface do League of Legends...');

  // Lista de processos a serem reiniciados
  const processes = [
    { name: 'LeagueClientUxRender', args: ['--render'] },
  ];

  // Reiniciar cada processo
  processes.forEach((process) => {
    try {
      execSync(`taskkill /f /im ${process.name}.exe`);
      outputMessage += `\nProcesso ` + chalk.yellowBright(process.name)+ ` reiniciado.`;
    } catch (error) {
      outputMessage += (chalk.redBright(`\n[ERROR] Ocorreu um erro ao reiniciar o processo ${process.name}: \nCódigo de erro: ${error}`));
    }
  });
}



async function configureMastery() {
  try {
    const persistedSettingsPath = await findPersistedSettings();

    const persistedSettingsData = await fs.promises.readFile(persistedSettingsPath, 'utf-8');
    const persistedSettings = JSON.parse(persistedSettingsData);
   // console.warn([[persistedSettingsData]])
    const gameEventsSection = persistedSettings.files.find(file => file.name === 'Input.ini').sections.find(section => section.name === 'GameEvents');
   // console.log(gameEventsSection); // Exibe o objeto diretamente no console

    const masteryEventIndex = gameEventsSection.settings.findIndex(setting => setting.name === 'evtChampMasteryDisplay');
    const masteryEvent = gameEventsSection.settings[masteryEventIndex];
    const masteryValue = masteryEvent.value;

    const isReadOnly = await isFileReadOnly(persistedSettingsPath);
    if (isReadOnly) {
      outputMessage = ('O arquivo PersistedSettings.json está em modo somente leitura. Desbloqueie as configurações antes de usar esta função.');
      showMenu();
      return;
    }

    console.log(chalk.yellow.bold('\nOpções de Bind de Maestria:'));
    console.log('  [1] Nada ao Ultar');
    console.log('  [2] Maestria ao Ultar');
    console.log('  [3] Emoji ao Ultar');
    console.log(`  [4] Cancelar`);

    const masteryOption = await askQuestion('\n » Por favor, digite o número da opção de Bind de Maestria que deseja configurar: ');
    const selectedMasteryIndex = parseInt(masteryOption) - 1;

    if (selectedMasteryIndex >= 0 && selectedMasteryIndex <= 2) {
      if (selectedMasteryIndex === 0) { // maestria no control 6
        masteryEvent.value = '[Ctrl][6]';
        info.Mastery = 0;

        const filteredSettings = gameEventsSection.settings.filter(setting => {
          return setting.name.includes("evtRadialEmotePlaySlot") && setting.value.includes("[r]");
        });
        filteredSettings.forEach(setting => {
          setting.value = setting.value.replace("[r]", "").trim();
        });


      } else if (selectedMasteryIndex === 1) { // maestria no R
        masteryEvent.value = '[Ctrl][6], [r]';
        info.Mastery == 1;
        const filteredSettings = gameEventsSection.settings.filter(setting => {
          return setting.name.includes("evtRadialEmotePlaySlot") && setting.value.includes("[r]");
        });
        filteredSettings.forEach(setting => {
          setting.value = setting.value.replace("[r]", "").trim();
        });
        
        

      } else if (selectedMasteryIndex === 2) { // maestria no emoji
        masteryEvent.value = '[Ctrl][6]';
        

        console.log(chalk.yellow.bold('\nOpções de Mostrar no Emoji:'));
        console.log('  [1] Mostrar no Emoji Norte');
        console.log('  [2] Mostrar no Emoji Nordeste');
        console.log('  [3] Mostrar no Emoji Leste');
        console.log('  [4] Mostrar no Emoji Sudeste');
        console.log('  [5] Mostrar no Emoji Sul');
        console.log('  [6] Mostrar no Emoji Suldoeste');
        console.log('  [7] Mostrar no Emoji Oeste');
        console.log('  [8] Mostrar no Emoji Noroeste');
        console.log('  [9] Mostrar no Emoji Centro');
        console.log(`[10] Cancelar`);

        const emojiOption = await askQuestion('\n » Por favor, digite o número da opção de Mostrar no Emoji que deseja configurar: ');
        const selectedEmojiIndex = parseInt(emojiOption) - 1;

        if (selectedEmojiIndex >= 0 && selectedEmojiIndex <= 8) {

          const radialEmoteEventIndex = gameEventsSection.settings.findIndex(setting => setting.name === `evtRadialEmotePlaySlot${selectedEmojiIndex}`);
          const radialEmoteEvent = gameEventsSection.settings[radialEmoteEventIndex];

          const filteredSettings = gameEventsSection.settings.filter(setting => {
            return setting.name.includes("evtRadialEmotePlaySlot") && setting.value.includes("[r]");
          });
          filteredSettings.forEach(setting => {
            setting.value = setting.value.replace("[r]", "").trim();
          });

          radialEmoteEvent.value += ', [r]';
          masteryEvent.value = '[Ctrl][6]';
          info.Mastery = 2;

        } else if (selectedEmojiIndex === 9) {

          outputMessage = ('Reconfiguração cancelada.');
          showMenu();
          return;

        } else {

          outputMessage = ('Opção inválida! Por favor, selecione uma opção válida.');
          showMenu();
          return;

        }
      }

      await fs.promises.writeFile(persistedSettingsPath, JSON.stringify(persistedSettings, null, 2), 'utf-8');

      outputMessage = (`Opção "Bind de Maestria" reconfigurada com sucesso.`);
    } else if (selectedMasteryIndex === 3) {
      outputMessage = ('Reconfiguração cancelada.');
    } else {
      outputMessage = ('Opção inválida! Por favor, selecione uma opção válida.');
    }
  } catch (error) {
    outputMessage = ('Erro ao processar o arquivo PersistedSettings.json. Certifique-se de que o LeaguePath esteja configurado corretamente. \n [ERRO]: ' + error);
  }

  showMenu();
}

async function isFileReadOnly(filePath) {
  try {
    const stats = await fs.promises.stat(filePath);
    return !(stats.mode & fs.constants.W_OK);
  } catch (error) {
    return true; // Em caso de erro, assume que o arquivo é somente leitura
  }
}

  


// Função para atualizar o arquivo info.json com as informações atualizadas
function updateInfoFile() {
  fs.writeFileSync(infoFilePath, JSON.stringify(info));
}

// Inicializa o programa exibindo o menu
showMenu();
