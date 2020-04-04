import axios from 'axios';
import sync from 'csv-parse/lib/sync';
import objectmapper from 'object-mapper';
import config from 'config';
import { S3 } from 'aws-sdk';
import { ITipJarClient, IRecipient, GoogleSheetIntegration } from '../../model';

const appConfig = config.get('app') as any;
const s3Config = config.get('s3') as any

export default class GoogleSheetClient implements ITipJarClient {
    private rows: string[][] = [];
    private refreshed = false;
    private rowMappings: { [ index: string]: string }[] = [];

    public constructor (
        private tipJarId: string,
        private s3 = new S3({ region: appConfig.get('region') }),
        private bucketName = s3Config.get('integrationsBucket')
    ) {

    }
    
    public async getRandomRecipients(count: number): Promise<IRecipient[]> {
        if (this.rows.length === 0) {
            await this.fetchRecipients();
        }
        const rows = [...Array(count).keys()].map(() => this.rows[Math.floor(Math.random() * this.rows.length)]);
        
        const recipients = rows.map(this.rowToRecipient.bind(this));
        console.log(recipients);
        return [];
    }

    public async updateRecipient(recipient: IRecipient): Promise<void> { }

    private async fetchRecipients() {
        if (this.refreshed) {
            throw new Error('Unable to fetch any recipients from tip jar');
        }

        const integrationDocument= await this.s3.getObject({
            Bucket: this.bucketName,
            Key: `${this.tipJarId}/integration.json`
        }).promise();

        if (!integrationDocument) {
            throw new Error('Unable to fetch integration document from S3');
        }

        let integrationDetails: GoogleSheetIntegration;
        try {
            integrationDetails = JSON.parse(integrationDocument.Body!.toString());
        } catch (e) {
            throw new Error('Integration JSON was malformed');
        }
        this.rowMappings = integrationDetails.mappings;

        let sheetBody: string;
        try {
            console.log(integrationDetails.url);
            const res = await axios({
                method: 'GET',
                url: integrationDetails.url
            });
            sheetBody = res.data;
        } catch (e) {
            throw new Error('Unable to fetch public Google Sheet');
        }

        const parsed = sync(
            sheetBody,
            {
                skip_lines_with_empty_values: true,
                from_line:  integrationDetails.skip || 1}
        );
        this.rows = parsed;
    }

    private rowToRecipient(line: string[]): IRecipient {
        let rec: { [ key: string ]: any } = {};
        for (let mapping of this.rowMappings) {
            const extracted = (objectmapper as any)(line, mapping);
            rec = { ...rec, ...extracted };
        }

        return rec as IRecipient;
    }
}
