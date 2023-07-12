const { execSync, spawn, exec } = require('child_process');
const package = require('./package.json');
const fs = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
const configFolderPath = 'C:/ConfigManager';
const infoFilePath = 'C:/ConfigManager/info.json';
let outputMessage = '';
const log = require('./utils/logger');
 
process.on("unhandledRejection", e => { 
  log.writeError('unhandledRejection',`INTERNAL`, e, Error)
  outputMessage = e;
 }) 
process.on("uncaughtException", e => { 
  log.writeError('uncaughtException',`INTERNAL`, e, Error)
  outputMessage = e;
 })  
process.on("uncaughtExceptionMonitor", e => { 
  log.writeError('uncaughtExceptionMonitor',`INTERNAL`, e, Error)
  outputMessage = e;
 })

exec('node -v', (error, stdout, stderr) => {
  if (error || stderr) {
    return console.log('O Node.js não está instalado! Entre em https://nodejs.org/pt-br e instale a versão LTS (marque a caixinha do chocolatey)');
  } 
});

async function readFile(filePath) {
  return fs.promises.readFile(filePath, 'utf8');
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
log.writeSilent('Informações carregadas' + JSON.stringify(info))

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
    throw new Error('Arquivo PersistedSettings.json não encontrado!');
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
  console.log(chalk.green.bold(figlet.textSync('ConfigManager.', { horizontalLayout: 'full' })));
  console.log(chalk.greenBright.bold(`Node: ${process.version} `+chalk.white.bold(`| APP: ${package.version} | FS: ${package.dependencies.fs} | PATH: ${package.dependencies.path} | FIGLET: ${package.dependencies.figlet} | ChildProcess: ${package.dependencies.child_process}`)))

  if (!info.LeaguePath) {
    const leaguePath = await askQuestion('O LeaguePath ainda não está configurado. Por favor, digite o caminho completo para a pasta "Config" do League of Legends: ');
    if (leaguePath) {
      info.LeaguePath = leaguePath.trim();
      updateInfoFile();
    } else {
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + chalk.redBright('O caminho do LeaguePath não pode estar vazio!'));
      showMenu();
      return;
    }
  }
  
  console.log(`\n\nBEM VINDO ao ConfigManager! este foi criado com o intuito de te ajudar a fazer algumas configurações\nque não existem por padrão no lol, e que normalmente são trabalhosas de ajustar, foi criado por mo-\ntivação pessoal, já que a preguiça reina em mim (dev), fique a vontade para divulgar ou modificar \nEssa aplicação, mas por favor dê os créditos a mim, me ajudará muito. Não posso garantir até \nquando darei suporte a esse programa, já que ele foi criado apenas porque estava com tempo.`)
  console.log('                  [Não afiliado com a Riot Games ou ao League of Legends.]')
  console.log(`
  Funcionalidades:\n` +
  chalk.yellow('  [X] Reconfigurar, solução de problemas e avisos\n  [CTRL+C] Sair')+
  chalk.greenBright.bold(`  
  [0] Abrir pasta de configuração do LoL  |  (Atualmente: ${info.LeaguePath ? chalk.yellowBright(info.LeaguePath) : chalk.redBright.bold('[!] Não configurado!')})
  [1] Trava de Configurações              |  (Trava/Destrava arquivos de configuração. Atualmente: ${info.ConfigLocked ? chalk.redBright('travado') : chalk.blueBright('destravado')})
  [2] ResetUI/UX                          |  (Corrigir erros de interface do Client)
  [3] Ult Charm                           |  (Mostrar emote ou maestria ao Ultar)
  [4] Abaixar prioridade                  |  (Trocar prioridade do Client)
  `)+ chalk.redBright('[5] Reiniciar o explorer (Ainda não implementado)'));
  await console.log(outputMessage || (chalk.cyanBright('OUTPUT: \n') + 'Sem comandos anteriores.'));
  const option = await askQuestion('\n ________________________________________________________________\n » Por favor, digite o número da opção que deseja selecionar: ');

  if (option.toUpperCase() === 'X') {
    await reconfigureOptions();
  } else {
    processMenuOption(option);
  }
}

async function reconfigureOptions() {
  console.clear();
  const fieldOptions = [
    { field: 'LeaguePath', description: 'Caminho para a pasta "Config" do League of Legends' },
    { field: 'ConfigLocked', description: 'Trava de configurações' },
  ];

  info.Mastery = 0;
  const persistedSettingsPath = await findPersistedSettings();

  const persistedSettingsData = await fs.promises.readFile(persistedSettingsPath, 'utf-8');
  const persistedSettings = JSON.parse(persistedSettingsData);
  const gameEventsSection = persistedSettings.files.find(file => file.name === 'Input.ini').sections.find(section => section.name === 'GameEvents');

  console.log(chalk.yellow.bold('\n\nReconfigurar Opções:\n\n'));
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

if (info.Mastery == 0) _m = 'Nenhum'
if (info.Mastery == 1) _m = 'Ultmate'
if (info.Mastery == 2) _m = 'Emote'
  data = [ 
    {LoLPath: `${info.LeaguePath}`},
    {Locked:  info.ConfigLocked},
    {Mastery: `${_m}`}
  ]
  console.table(data)

  fieldOptions.forEach((option, index) => {
    console.log(`[${index + 1}] ${option.description}`);
  });
  console.log(`[${fieldOptions.length + 1}] Cancelar`);
  console.log(chalk.redBright.bold('\n\n Caso não resolva, garanta que o aplicativo tem acesso a pasta C:/ConfigManager, caso o problema persista,\n tente deleta-la e reinicie o programa, se não adiantar abra o arquivo Dependencies.bat. garanta que \n você possui o node.js instalado e que possui o League Of Legends instalado,\n já tendo entrado em 1 partida ao menos 1 vez. Se persistir contate a mim por onde você conseguiu esse programa.'))
  console.log(chalk.blueBright.bold('\n ConfigManager não é afiliado a Riot Games e nem modifica ou interage internamente com dll ou processos do jogo, \n apenas modifica arquivos de configuração que o próprio usuário poderia modificar manualmente e não da ban. \n isso não é um script(hack) e nem possui tecnologia para tal, em caso de duvidas me contate.'));

  const option = await askQuestion('\n » Por favor, digite o número da opção que deseja reconfigurar: ');

  const selectedIndex = parseInt(option) - 1;
  if (selectedIndex >= 0 && selectedIndex < fieldOptions.length) {
    const selectedOption = fieldOptions[selectedIndex];
    let newValue;

     if (selectedOption.field === 'ConfigLocked') {
      const lockOption = await askQuestion('\n » Digite o novo valor para a Trava de Configurações (true/false): ');
      newValue = lockOption.trim().toLowerCase() === 'true';
      toggleConfigLock(newValue); // Chama a função toggleConfigLock() passando o novo valor como argumento
    } else {
      newValue = await askQuestion(`\n » Digite o novo valor para "${selectedOption.description}": `);
    }

    info[selectedOption.field] = newValue;
    outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Opção "${selectedOption.description}" reconfigurada com sucesso.`);
    updateInfoFile();
  } else if (selectedIndex === fieldOptions.length) {
    outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Reconfiguração cancelada.');
  } else {
    outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Opção inválida! Por favor, selecione uma opção válida.');
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
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Opção inválida! Por favor, selecione uma opção válida.');
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
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Processo do LeagueUxRender colocado em tempo real.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 256`);
          showMenu();
          return;
        } else if(selectedPriority == 1) {
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Processo do LeagueUxRender colocado em Alto.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 128`);
          showMenu();
          return;
        } else if(selectedPriority == 2) {
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Processo do LeagueUxRender colocado em Acima do normal.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 32768`);
          showMenu();
          return;
        } else if(selectedPriority == 3) {
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Processo do LeagueUxRender de volta a prioridade normal.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 32`);
          showMenu();
          return;
        } else if(selectedPriority == 4) {
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Processo do LeagueUxRender colocado abaixo do normal.`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 16384`);
          showMenu();
          return;
        } else if(selectedPriority == 5) {
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Processo do LeagueUxRender colocado em baixa prioridade`);
          execSync(`wmic process where "name='LeagueClientUxRender.exe'" CALL setpriority 64`);
          showMenu();
          return;
        } else {
          outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Opção inválida! Por favor, selecione uma opção válida.');
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
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Pasta do LeaguePath aberta com sucesso!`);
    } catch (error) {
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + chalk.redBright(`[ERROR] Ocorreu um erro ao abrir a pasta do LeaguePath: ${error.message}`));
    }
    showMenu();
  } else {
    outputMessage = (chalk.cyanBright('OUTPUT: \n') + chalk.yellowBright.bold('[ALERTA] O LeaguePath ainda não está configurado! Por favor, configure-o primeiro.'));
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
    outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'As configurações já estão travadas!');
    showMenu();
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0444');
      info.ConfigLocked = true;
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Trava de configurações ativa. As configurações foram destravadas com sucesso!');
      updateInfoFile();
    } catch (error) {
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + chalk.redBright(`[ERROR] Ocorreu um erro ao travar as configurações: ${error}`));
    } finally {
      showMenu();
    }
  }
}

// Função para destravar as configurações
function unlockConfig() {
  if (!info.ConfigLocked) {
    outputMessage = chalk.cyanBright('OUTPUT: \n') + 'As configurações já estão destravadas!';
    showMenu();
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0666');
      info.ConfigLocked = false;
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Trava de configurações desativada. As configurações foram destravadas com sucesso!');
      updateInfoFile();
    } catch (error) {
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + chalk.redBright(`[ERROR] Ocorreu um erro ao destravar as configurações: ${error}`));
    } finally {
      showMenu();
    }
  }
}

// Função para reiniciar os processos relacionados ao League of Legends
function resetUX() {
  outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Reiniciando interface do League of Legends...');

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
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'O arquivo PersistedSettings.json está em modo somente leitura. Desbloqueie as configurações antes de usar esta função.');
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

          outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Reconfiguração cancelada.');
          showMenu();
          return;

        } else {

          outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Opção inválida! Por favor, selecione uma opção válida.');
          showMenu();
          return;

        }
      }

      await fs.promises.writeFile(persistedSettingsPath, JSON.stringify(persistedSettings, null, 2), 'utf-8');

      outputMessage = (chalk.cyanBright('OUTPUT: \n') + `Opção "Bind de Maestria" reconfigurada com sucesso.`);
    } else if (selectedMasteryIndex === 3) {
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Reconfiguração cancelada.');
    } else {
      outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Opção inválida! Por favor, selecione uma opção válida.');
    }
  } catch (error) {
    outputMessage = (chalk.cyanBright('OUTPUT: \n') + 'Erro ao processar o arquivo PersistedSettings.json. Certifique-se de que o LeaguePath esteja configurado corretamente. \n [ERRO]: ' + error);
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
