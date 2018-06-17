import { getSetting } from './settings'
import { redis } from 'pub-sub-redis'
import { slack as slackCreator } from './slack'
import { slackStorage } from './storage/slack'

const cloudStorageProvider = getSetting('cloudStorage')
const pubsubProvider = getSetting('pubsub')
console.log('cloudStorageProvider', cloudStorageProvider)

const imports = [
    import('./pub-sub'),
    import(`./storage`),
    import(`./pub-sub/gcp`)
]

Promise.all(imports)
.then(([
    { [pubsubProvider]: pubsub },
    { [cloudStorageProvider] : cloudStorage },
    { gcp }
]) => {
    const { publisherCreator, subscriberCreator } = pubsub({
        host: process.argv[2] === 'dev' ? '127.0.0.1' : 'main.local'
    })
    return Promise.all([
        publisherCreator(),
        subscriberCreator()
    ])
    .then(([
        { publish },
        { subscribe }
    ]) => {
        const slack = slackCreator({ publish })
        gcp({ getSetting })
        .then(({
            allGcpMsgs,
            filterGcpMsgs
        }) => {
            slackStorage({ allGcpMsgs, filterGcpMsgs, getSetting, slack })
        })
        const pubsubFunctions = {
            publish,
            subscribe
        }
        // cloudStorage({ ...pubsubFunctions, getSetting, slack })
        return
    })
})
