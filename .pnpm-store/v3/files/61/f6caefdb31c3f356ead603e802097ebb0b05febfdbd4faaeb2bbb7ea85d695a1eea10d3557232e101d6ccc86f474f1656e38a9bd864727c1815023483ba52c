'use strict';

var path = require('path');
var common = require('storybook/internal/common');

function previewAnnotations(entry=[],options){return common.checkAddonOrder({before:{name:"@storybook/addon-actions",inEssentials:!0},after:{name:"@storybook/addon-interactions",inEssentials:!1},configFile:path.isAbsolute(options.configDir)?path.join(options.configDir,"main"):path.join(process.cwd(),options.configDir,"main"),getConfig:configFile=>common.serverRequire(configFile)}),entry}var ADDON_INTERACTIONS_IN_USE=!0;

exports.ADDON_INTERACTIONS_IN_USE = ADDON_INTERACTIONS_IN_USE;
exports.previewAnnotations = previewAnnotations;
