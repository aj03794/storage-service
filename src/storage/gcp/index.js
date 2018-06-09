import Storage from '@google-cloud/storage'
import { createBucket,  checkIfBucketExists } from './bucket-operations'
import { uploadFile } from './file-operations'
import { queue } from 'async'
import { resolve as resolvePath } from 'path'
import { cwd } from 'process'

export const gcpCloudStorage = ({
	publish,
	subscribe,
	getSetting
}) => {
	console.log('GCP Cloud Storage')
	const queue = q({ publish })
	subscribe({
		channel: 'cloud storage'
	})
	.then(({ allMsgs, filterMsgs }) => {
		filterMsgs(msg => {
			return msg.data
		}).subscribe(msg => {
			enqueue({ msg, queue, getSetting })
		})
	})
}

export const doPhotoUpload = ({ msg, getSetting }) => new Promise((resolve, reject) => {
	console.log('-------------------------')
	console.log('doPhotoUpload - GCP')
	// const bucketName = process.env.BUCKET_NAME
	const bucketName = getSetting('bucketName')
	const gcpCreds = getSetting('googleApplicationCredentials')
	const { location, name: file } = JSON.parse(msg.data[1])
	const keyFilename = resolvePath(cwd(), gcpCreds)
	const storage = new Storage({
		keyFilename
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

export const q = ({ publish }) => queue(({ msg, getSetting }, cb) => {
	doPhotoUpload({ msg, getSetting })
	  .then(cb)
  })
  
  export const enqueue = ({ msg, queue, getSetting }) => new Promise((resolve, reject) => {
	  console.log('Queueing message: ', msg)
	  queue.push({ msg, getSetting })
	  return resolve()
  })
