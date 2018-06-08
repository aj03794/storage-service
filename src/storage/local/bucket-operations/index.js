export const createBucket = ({ storage, bucketName }) => new Promise((resolve, reject) => {
	return storage
		.createBucket(bucketName)
		.then(() => {
			console.log(`bucket ${bucketName} created.`);
			resolve()
		})
		.catch(err => {
			console.error('ERROR:', err);
		})
})

export const checkIfBucketExists = ({ storage, bucketName }) => new Promise((resolve, reject) => {
	return storage
		.getBuckets()
		.then(buckets => {
			console.log('buckets', buckets)
			const bucket = buckets.filter(bucket => {
				return bucket.metadata.id === bucketName
			})
			.map(bucket => {
				return {
					meta: {},
					data: {
						name: bucket.metadata.id
					}
				}
			})[0]
			return resolve(bucket ? bucket : null)
		})
		.catch(err => console.log('err retrieving buckets', err))
})
