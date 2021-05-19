# tips-reminder
Reminds people to tip

### Abstractions
- EventHandler
- SQSClient
    - sendMessage
- TipJarClient
    - getRandomRecipients
- TipperServiceClient
    - getDueTippers
    - updateTippers
- TwilioClient
    - sendText
- S3Client
    - getTipJarConfig
- TextFormatter?
    - formatText

**Logging considerations**
- ALWAYS LOG TIPJARID for billing
- ALWAYS LOG JOB ID