import { queue } from 'async'
import dateTime from 'date-time'
import { gcp } from '../../pub-sub/gcp'
import zipdir from 'zip-dir'
import { cwd } from 'process'
import { resolve as resolvePath } from 'path'

const timestamp = () => {
    console.log('DATETIME', dateTime({ local: true }))
    return dateTime({ local: true })
}

export const slackStorage = ({
	allGcpMsgs,
	filterGcpMsgs,
	getSetting,
	slack
}) => {
    // allGcpMsgs(msg => {
    //     console.log('===============>', msg)
    // })
    const queue = q()
    filterGcpMsgs(msg => {
        if (
            msg
            && msg.data
            && msg.data.message
            && msg.data.message.data
            && msg.data.message.data.body
            && msg.data.message.data.body.command
        ) {
            if (msg.data.message.data.body.command === '/retrieve-photos'){
                return true
            }
            return false
        }
        return false
    }).subscribe(msg => {
        enqueue({ msg, queue, getSetting, slack })
        // enqueue request
    })
}

export const doZipUpload = ({
    msg,
    getSetting,
    slack
}) => new Promise((resolve, reject) => {
    const dirLocation = resolvePath(cwd(), 'buckets', 'smart-hms-photos')
    const saveTo = resolvePath(cwd(), `smart-hms-photos.zip`)
    console.log('dirLocation', dirLocation)
    console.log('SAVETO', saveTo)
    zipdir(dirLocation, { saveTo }, (err, buffer) => {
        if (err) {
            console.log('zipdir error', err)
            return reject()
        }
        slack({
            slackMsg: {
				meta: {
					timestamp: timestamp()
				},
                msg: 'Photo upload successful - local',
                operation: 'FILE_UPLOAD',
				file: saveTo,
            }
        })
        resolve()
    })
})

export const q = () => queue((data, cb) => {
    doZipUpload(data)
      .then(cb)
  })
  
  export const enqueue = ({ msg, queue, getSetting, slack }) => new Promise((resolve, reject) => {
      console.log('Queueing message: ', msg)
      queue.push({ msg, getSetting, slack })
      return resolve()
  })
