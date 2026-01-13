'use strict';

var path = require('path');
var common = require('storybook/internal/common');
var nodeLogger = require('storybook/internal/node-logger');

var requireMain=configDir=>{let absoluteConfigDir=path.isAbsolute(configDir)?configDir:path.join(process.cwd(),configDir),mainFile=path.join(absoluteConfigDir,"main");return common.serverRequire(mainFile)??{}};function addons(options){let checkInstalled=(addonName,main2)=>{let addon=`@storybook/addon-${addonName}`,existingAddon=main2.addons?.find(entry=>(typeof entry=="string"?entry:entry.name)?.startsWith(addon));return existingAddon&&nodeLogger.logger.info(`Found existing addon ${JSON.stringify(existingAddon)}, skipping.`),!!existingAddon},main=requireMain(options.configDir);return ["controls","actions","docs","backgrounds","viewport","toolbars","measure","outline","highlight"].filter(key=>options[key]!==!1).filter(addon=>!checkInstalled(addon,main)).map(addon=>`@storybook/addon-essentials/${addon}`)}

exports.addons = addons;
