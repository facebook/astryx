import { addons } from 'storybook/internal/manager-api';

var ADDON_ID="storybook/links";var constants_default={NAVIGATE:`${ADDON_ID}/navigate`,REQUEST:`${ADDON_ID}/request`,RECEIVE:`${ADDON_ID}/receive`};addons.register(ADDON_ID,api=>{api.on(constants_default.REQUEST,({kind,name})=>{let id=api.storyId(kind,name);api.emit(constants_default.RECEIVE,id);});});
