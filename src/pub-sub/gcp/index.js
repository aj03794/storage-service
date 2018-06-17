import PubSub from '@google-cloud/pubsub'
import { createSubject } from 'create-subject-with-filter'
import { resolve as resolvePath } from 'path'
import { cwd } from 'process'

export const gcp = ({
  getSetting
}) => new Promise((resolve, reject) => {
  console.log('GCP')
  const {
    subscribe: allGcpMsgs,
    filter: filterGcpMsgs,
    next
  } = createSubject()

  const gcpCreds = getSetting('googleApplicationCredentials')
  const subscription = 'projects/smart-home-monitoring-system/subscriptions/upload-photos'
	const keyFilename = resolvePath(cwd(), gcpCreds)
	const pubsub = new PubSub({
		keyFilename
  })
  const subscription = pubsub.subscription(subscription)

  const messageHandler = message => {
    console.log(`Received message`, message)
    console.log('message.data', JSON.parse(message.data.toString('utf-8')))
    next({
      meta: {
        timestamp: 'placeholder'
      },
      data: {
        message: JSON.parse(message.data.toString('utf-8'))
      }
    })
    message.ack()
  }

  subscription.on(`message`, messageHandler)

  return resolve({
    allGcpMsgs,
    filterGcpMsgs
  })

})

