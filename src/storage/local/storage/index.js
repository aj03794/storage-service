import { writeFile, mkdir as makeDir, ensureDir, readdir as readDir, copy } from 'fs-extra'
import { resolve as resolvePath, basename } from 'path'
import { cwd } from 'process'

export function Storage({ projectId }) {

	this.bucket = bucketName => {
		this.bucketName = bucketName
		return this
	}

	this.upload = (fileName) => new Promise((resolve, reject) => {
		const src = resolvePath(fileName)
		console.log('src', src)
		const destFileName = basename(src)
		// const projectDir = resolvePath(process.env.PROJECT_DIR)
		const projectDir = resolvePath(cwd())
		console.log('projectDir', projectDir)
		const destination = resolvePath(
			projectDir,
			'buckets',
			this.bucketName,
			destFileName
		)
		console.log('destFileName', destFileName)
		console.log('destination', destination)
		return copy(src, destination, err => {
			if (err) {
				console.log('Err uploading file - local', err)
				return reject(err)
			}
			console.log('Success!')
			return resolve()
		})
	})

	this.getBuckets = () => new Promise((resolve, reject) => {
		return ensureDir(resolvePath(cwd(), 'buckets'))
			.then(() => {
				return readDir(resolvePath(cwd(), 'buckets'), (err, buckets) => {
					if (err) {
						console.log('Err getBuckets - local', err)
						return reject({
							method: 'getBuckets',
							data: {
								err
							}
						})
					}
					return resolve(buckets.map(bucket => {
						return {
							metadata: {
								id: bucket
							}
						}
					}))
					// return resolve(files)
				})
			})
			.catch(err => console.log('getBuckets - err', err))
	})

	this.createBucket = (bucketName) => new Promise((resolve, reject) => {
		return makeDir(resolvePath(cwd(), 'buckets', bucketName), err => {
			if (err) {
				console.log('Error creating bucket - local', err)
				return reject({
					method: 'createBucket',
					data: {
						err
					}
				})
			}
			return resolve()
		})
	})

}
