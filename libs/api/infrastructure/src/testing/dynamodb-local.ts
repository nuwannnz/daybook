import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GenericContainer, type StartedTestContainer } from 'testcontainers';

const DYNAMODB_LOCAL_IMAGE = 'amazon/dynamodb-local:latest';
const DYNAMODB_LOCAL_PORT = 8000;

export interface DynamoDbLocal {
  client: DynamoDBClient;
  endpoint: string;
  stop: () => Promise<void>;
}

export async function startDynamoDbLocal(): Promise<DynamoDbLocal> {
  const container: StartedTestContainer = await new GenericContainer(DYNAMODB_LOCAL_IMAGE)
    .withExposedPorts(DYNAMODB_LOCAL_PORT)
    .withCommand(['-jar', 'DynamoDBLocal.jar', '-inMemory', '-sharedDb'])
    .start();
  const endpoint = `http://${container.getHost()}:${container.getMappedPort(DYNAMODB_LOCAL_PORT)}`;
  const client = new DynamoDBClient({
    endpoint,
    region: 'us-east-1',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
  });

  return {
    client,
    endpoint,
    stop: async () => {
      client.destroy();
      await container.stop();
    },
  };
}
