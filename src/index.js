import { getSetting } from './settings'
import { redis } from 'pub-sub-redis'
import { slack as slackCreator } from './slack'

const cloudStorageProvider = getSetting('cloudStorage')
const pubsubProvider = getSetting('pubsub')
console.log('cloudStorageProvider', cloudStorageProvider)

const imports = [
    import('./pub-sub'),
    import(`./storage`)
]

Promise.all(imports)
.then(([
    { [pubsubProvider]: pubsub },
    { [cloudStorageProvider] : cloudStorage }
]) => {
    const { publisherCreator, subscriberCreator } = pubsub()
    return Promise.all([
        publisherCreator(),
        subscriberCreator()
    ])
    .then(([
        { publish },
        { subscribe }
    ]) => {
        const slack = slackCreator({ publish })
        const pubsubFunctions = {
            publish,
            subscribe
        }
        cloudStorage({ ...pubsubFunctions, getSetting, slack })
        return
    })
})
