import request from 'supertest';
import app from '../index';

describe('GET /health', () => {
  const originalNetwork = process.env.STELLAR_NETWORK;

  afterEach(() => {
    if (originalNetwork === undefined) {
      delete process.env.STELLAR_NETWORK;
    } else {
      process.env.STELLAR_NETWORK = originalNetwork;
    }
  });

  it('returns ok status and the configured Stellar network', async () => {
    process.env.STELLAR_NETWORK = 'testnet';

    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok', network: 'testnet' });
  });
});
