export const slack = ({
    publish,
    channel = 'slack',
}) => ({
    slackMsg,
    slackChannel='general'
}) => new Promise((resolve, reject) => {
    publish({
        channel,
        data: {
            slackData: {
                channel: slackChannel,
                msg: slackMsg
            }
        }
    })
    resolve()
})