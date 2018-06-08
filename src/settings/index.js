import { resolve as resolvePath } from 'path'
import fs from 'fs'

export const getSetting = (settingToRetrieve) => {
  let setting
  try {
    console.log('SETTING FROM FILE', settingToRetrieve)
    setting = JSON.parse(fs.readFileSync(resolvePath(__dirname, 'settings.json')))[settingToRetrieve]
  } catch (e) {
		console.log('Error getSetting', e)
  }
  console.log(setting)
  return setting
}
