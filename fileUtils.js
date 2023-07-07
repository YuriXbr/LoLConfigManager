const fs = require('fs');
const path = require('path');

function updateInfoFile(info, infoFilePath) {
  fs.writeFileSync(infoFilePath, JSON.stringify(info, null, 2));
}

function verifyPersistedSettingsReadOnlyState(info, infoFilePath) {
  const persistedSettingsPath = path.join(info.LeaguePath, 'PersistedSettings.json');
  const stats = fs.statSync(persistedSettingsPath);
  if (!(stats.mode & fs.constants.W_OK)) {
    info.ConfigLocked = true;
    info.outputMessage = '\nAs configurações estão atualmente travadas.';
    updateInfoFile(info, infoFilePath);
  }
}

module.exports = {
  updateInfoFile,
  verifyPersistedSettingsReadOnlyState,
};
