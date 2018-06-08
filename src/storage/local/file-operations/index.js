import { resolve as resolvePath } from 'path'

export const uploadFile = ({ storage, bucketName, file, location }) => new Promise((resolve, reject) => {
	// console.log('storage', storage)
	console.log('LOCATION', location)
	console.log('FILE', file)
	const fileName = resolvePath(`${location}/${file}`)
	console.log('fileName', fileName)
	return storage
	.bucket(bucketName)
	.upload(fileName)
	.then(() => {
	  console.log(`${file} uploaded to ${bucketName}.`)
		resolve({
		  msg: `${file} uploaded to ${bucketName}`
		})
	})
	.catch(err => {
	  console.error('ERROR in uploading: ', err)
		reject({
		  msg: 'Uploading error',
		  err
		})
	})
})
