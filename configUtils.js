const fs = require('fs');
const path = require('path');

const { updateInfoFile, getConfigLockStatus } = require('./fileUtils');

// Função para verificar e sincronizar o estado de somente leitura do arquivo PersistedSettings.json
function verifyPersistedSettingsReadOnlyState(info) {
  const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
  let isReadOnly = false;
  try {
    fs.accessSync(persistedSettingsPath, fs.constants.W_OK);
  } catch (error) {
    if (error.code === 'EPERM') {
      isReadOnly = true;
    } else {
      throw error;
    }
  }

  if (info.ConfigLocked !== isReadOnly) {
    info.ConfigLocked = isReadOnly;
    updateInfoFile();
  }
}

// Função para travar as configurações
function lockConfig(info) {
  if (info.ConfigLocked) {
    console.log('\nAs configurações já estão travadas!');
    showMenu();
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0444');
      info.ConfigLocked = true;
      console.log('\nTrava de configurações ativada. As configurações estão agora travadas.');
      updateInfoFile();
      showMenu();
    } catch (error) {
      console.error('[ERRO]: Ocorreu um erro ao travar as configurações.', error);
    }
  }
}

// Função para destravar as configurações
function unlockConfig(info) {
  if (!info.ConfigLocked) {
    console.log('\nAs configurações já estão destravadas!');
    showMenu();
  } else {
    const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
    try {
      fs.chmodSync(persistedSettingsPath, '0666');
      info.ConfigLocked = false;
      console.log('\nTrava de configurações desativada. As configurações estão agora destravadas.');
      updateInfoFile();
      showMenu();
    } catch (error) {
      console.error('[ERRO]: Ocorreu um erro ao destravar as configurações.', error);
    }
  }
}

module.exports = {
  verifyPersistedSettingsReadOnlyState,
  lockConfig,
  unlockConfig,
};
