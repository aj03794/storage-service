import Storage from '@google-cloud/storage'
import { createBucket,  checkIfBucketExists } from './bucket-operations'
import { uploadFile } from './file-operations'
import { queue } from 'async'

export const gcpCloudStorage = ({ publish, subscribe }) => {
	console.log('-------------------------')
	console.log('gcpCloudStorage')
	const queue = q({ publish })
	subscribe({
		channel: 'cloud storage'
	})
	.then(({ connect }) => connect())
	.then(({ allMsgs, filterMsgs }) => {
		filterMsgs(msg => {
			return msg.data
		}).subscribe(msg => {
			enqueue({ msg, queue })
		})
	})
}

export const doPhotoUpload = ({ msg }) => new Promise((resolve, reject) => {
	console.log('-------------------------')
	console.log('doPhotoUpload - GCP')
	// const bucketName = process.env.BUCKET_NAME
	const bucketName = getSetting('bucketName')
	const { location, name: file } = JSON.parse(msg.data[1])
	const storage = new Storage({
		projectId: process.env.GCP_PROJECT_ID
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
				cloudProvider: 'gcp',
				upload: 'successful'
			}
		})
	})
})

export const q = ({ publish }) => queue((msg, cb) => {
    doPhotoUpload({ msg })
	.then(cb)
})

export const enqueue = ({ msg, queue }) => new Promise((resolve, reject) => {
    console.log('Queueing message - cloud storage: ', msg)
	queue.push(msg)
    return resolve()
})
