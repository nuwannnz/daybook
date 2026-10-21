import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { startDynamoDbLocal, type DynamoDbLocal } from './dynamodb-local';

describe('DynamoDB Local through Testcontainers', () => {
  let database: DynamoDbLocal;

  beforeAll(async () => {
    database = await startDynamoDbLocal();
  }, 120_000);

  afterAll(async () => {
    await database.stop();
  });

  it('creates and lists a table', async () => {
    await database.client.send(
      new CreateTableCommand({
        TableName: 'sample',
        BillingMode: 'PAY_PER_REQUEST',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
      }),
    );

    const result = await database.client.send(new ListTablesCommand({}));

    expect(result.TableNames).toEqual(['sample']);
  });
});
