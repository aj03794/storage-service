import { Storage } from './storage'
import { checkIfBucketExists, createBucket } from './bucket-operations'
import { uploadFile } from './file-operations'
import { queue } from 'async'
import { resolve as resolvePath } from 'path'
import { cwd } from 'process'

export const localStorage = ({
	publish,
	subscribe,
	getSetting
}) => {
	console.log('Local Storage')
	const queue = q({ publish })
	subscribe({
		channel: 'cloud storage'
	})
	.then(({ allMsgs, filterMsgs }) => {
		filterMsgs(msg => {
			return msg.data
		}).subscribe(msg => {
			return enqueue({ msg, queue, getSetting })
		})
	})
}

export const doPhotoUpload = ({ msg, getSetting }) => new Promise((resolve, reject) => {
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
	.then(() => {
		console.log('Upload successful')
		resolve({
			meta: {},
			data: {
				cloudProvider: 'local',
				upload: 'successful'
			}
		})
	})
})

export const q = ({ publish }) => queue(({ msg, getSetting }, cb) => {
  doPhotoUpload({ msg, getSetting })
	.then(cb)
})

export const enqueue = ({ msg, queue, getSetting }) => new Promise((resolve, reject) => {
    console.log('Queueing message: ', msg)
	queue.push({ msg, getSetting })
    return resolve()
})
