import { Storage } from './storage'
import { checkIfBucketExists, createBucket } from './bucket-operations'
import { uploadFile } from './file-operations'
import { queue } from 'async'
import { resolve as resolvePath } from 'path'
import { cwd } from 'process'
import { manageStorage } from './manage-storage'
import dateTime from 'date-time'

const timestamp = () => {
    console.log('DATETIME', dateTime({ local: true }))
    return dateTime({ local: true })
}

export const localStorage = ({
	publish,
	subscribe,
	getSetting,
	slack
}) => {
	console.log('Local Storage')
	const machineUuid = process.env.UUID || 'dev'
	console.log('machineUuid', machineUuid)
	const queue = q({ publish })
	subscribe({
		channel: 'cloud storage'
	})
	.then(({ allMsgs, filterMsgs }) => {
		filterMsgs(msg => {
			if (msg.data) {
				const { uuid } = JSON.parse(msg.data[1])
				console.log('Incoming UUID', uuid)
				if (uuid !== machineUuid) {
					return false
				}
				return msg.data && uuid
			}
			return false
		}).subscribe(msg => {
			return enqueue({ msg, queue, getSetting, slack })
		})
	})
}

export const doPhotoUpload = ({ msg, getSetting, slack }) => new Promise((resolve, reject) => {
	console.log('doPhotoUpload - Local')
	const bucketName = getSetting('bucketName')
	const { folder, name: file, location } = JSON.parse(msg.data[1])
	const storage = new Storage({
		projectId: getSetting('projectId')
	})
	checkIfBucketExists({ storage, bucketName })
	.then(bucket => {
		if (!bucket) {
			console.log('Bucket does not exist')
			return createBucket({ storage, bucketName })
			.catch(err => reject(err))
		}
		console.log('Bucket exists')
		return
	})
	.then(() => uploadFile({ storage, bucketName, file, location }))
	.then(() => manageStorage({
		location:  resolvePath(cwd(), 'buckets', bucketName),
		maxFiles: getSetting('maxFiles')
	}))
	.then(() => {
		console.log('Upload successful')
		slack({
            slackMsg: {
				meta: {
					timestamp: timestamp()
				},
				msg: 'Photo upload successful - local',
				fileName: file,
				uuid: process.env.UUID
            }
		})
		resolve()
	})
})

export const q = ({ publish }) => queue((data, cb) => {
  doPhotoUpload(data)
	.then(cb)
})

export const enqueue = ({ msg, queue, getSetting, slack }) => new Promise((resolve, reject) => {
    console.log('Queueing message: ', msg)
	queue.push({ msg, getSetting, slack })
    return resolve()
})
