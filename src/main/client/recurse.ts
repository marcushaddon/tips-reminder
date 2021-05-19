import { Lambda } from 'aws-sdk';
import config from '../../config';

const appConfig = (config.get('app') as any).get('region');
const lambdaName = (config.get('lambda') as any).get('lambdaName');

const lambda = new Lambda({ region: appConfig.region });

const messageSelf = async (message: any ) => {
    await lambda.invokeAsync({
        FunctionName: lambdaName,
        InvokeArgs: JSON.stringify(message)
    }).promise();
}

export default messageSelf;
