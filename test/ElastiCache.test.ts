import { ElastiCache } from '../src';

describe.skip('ElastiCache integration tests', () => {
  test('returns a list of all cache clusters', async () => {
    const elastiCache = new ElastiCache();
    const clusterSummaries = await elastiCache.listCacheClusters();

    // adjust to your settings
    expect(clusterSummaries.length).toBeGreaterThanOrEqual(1);
  });
});
