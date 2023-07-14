const c = require('./colorcodes.js');
const fs = require('fs');
var today = new Date();
var data = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + '   ' + today.getHours() + '-' + today.getMinutes() + '-' + today.getSeconds();

ptBR = {
    nothing: "",
    defaultMessage: "",
    appName: "ConfigManager",
    newVersion: "Nova versão disponivel, acesse https://github.com/YuriXbr/LoLConfigManager/releases/",
    updatedVersion: "Ultima versão",
    nodeNotExist: "O Node.js não está instalado! Entre em https://nodejs.org/pt-br e instale a versão LTS (marque a caixinha do chocolatey)",
    loadedInfo: "Informações carregadas",
    configFileNotFound: "Arquivo PersistedSettings.json não encontrado!",
    missingLeaguePathConfig: 'O LeaguePath ainda não está configurado. Por favor, digite o caminho completo para a pasta "Config" do League of Legends: ',
    invalidLeaguePathDir: "[ERRO] O caminho do LeaguePath não pode estar vazio!",
    notAffiliated: '                  [Não afiliado com a Riot Games ou ao League of Legends.]\n',
    functions: '  Funcionalidades:\n',
    menuNotConfigured: "[!] Não configurado!",
    menuLocked: "travado",
    menuUnlocked: "destravado",
    menuOp0:'  [0] Abrir pasta de configuração do LoL  |  (Atualmente:',
    menuOp1:'  [1] Trava de Configurações              |  (Trava/Destrava arquivos de configuração. Atualmente: ',
    menuOp2:'  [2] ResetUI/UX                          |  (Corrigir erros de interface do Client)',
    menuOp3:`  [3] Ult Charm                           |  (Mostrar emote ou maestria ao Ultar)`,
    menuOp4:`  [4] Abaixar prioridade                  |  (Trocar prioridade do Client)`,
    menuOp5:'  [5] Reiniciar o explorer                |  (Ainda não implementado)',
    menuOpX:'\n  [X] Configurações',
    menuOpC:'  [CTRL+C] Sair',
    menuOutput: "\nOUTPUT:",
    menuNoCommands: 'Sem comandos anteriores.',
    askQuestionSelectAOption: ' » Por favor, digite o número da opção que deseja selecionar: ',
    reconfigureOptionsConfigPath: 'Caminho para a pasta "Config" do League of Legends',
    reconfigureOptionsConfigLocked: 'Trava de configurações',
    reconfigureOptionsLabel: "\n\nReconfigurar Opções:\n\n",
    infoMasteryNone: "Nenhum",
    infoMasteryUltimate: "Ultimate",
    infoMasteryEmote: "Emote",
    cancel: "Cancelar",
    redWarning: '\n\n Caso não resolva, garanta que o aplicativo tem acesso a pasta C:/ConfigManager, caso o problema persista,\n tente deleta-la e reinicie o programa, se não adiantar abra o arquivo Dependencies.bat. garanta que \n você possui o node.js instalado e que possui o League Of Legends instalado,\n já tendo entrado em 1 partida ao menos 1 vez. Se persistir contate a mim por onde você conseguiu esse programa.',
    blueWarning: '\n ConfigManager não é afiliado a Riot Games e nem modifica ou interage internamente com dll ou processos do jogo, \n apenas modifica arquivos de configuração que o próprio usuário poderia modificar manualmente e não da ban. \n isso não é um script(hack) e nem possui tecnologia para tal, em caso de duvidas me contate.',
    reconfigureOptionsQuestion: '\n » Por favor, digite o número da opção que deseja reconfigurar: ',
    reconfigureOptionsNewValueConfigLocked: '\n » Digite o novo valor para a Trava de Configurações (true/false): ',
    reconfigureOptionsNewValueTo: '\n » Digite o novo valor para',
    reconfigureOptionsOption: "Opção",
    reconfigureOptionsSuccess: "reconfigurada com sucesso.",
    reconfigureOptionsCancel: 'Reconfiguração cancelada.',
    invalidOption: "Opção inválida! Por favor, selecione uma opção válida.",
}

enUS = {

}

module.exports = {
    ptBR,
    enUS
}