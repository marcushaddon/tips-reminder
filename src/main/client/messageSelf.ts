import { SQS } from 'aws-sdk';
import config from 'config';

const appConfig = (config.get('app') as any).get('region');
const upstreamQueueUrl = (config.get('sqs') as any).get('upstreamQueueUrl');

const upstreamSQSClient = new SQS({ region: appConfig.region });

const messageSelf = async (message: any ) => {
    await upstreamSQSClient.sendMessage({
        QueueUrl: upstreamQueueUrl,
        MessageBody: JSON.stringify(message)
    }).promise();
}

export default messageSelf;
