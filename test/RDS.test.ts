import { RDS } from '../src';

describe.skip('RDS integration tests', () => {
  test('returns a list of all db clusters', async () => {
    const rds = new RDS();
    const clusterSummaries = await rds.listClusters();
    // adjust to your settings
    expect(clusterSummaries.length).toBeGreaterThanOrEqual(1);
  });

  test('returns a list of all db instances', async () => {
    const rds = new RDS();
    const instanceSummaries = await rds.listInstances();
    console.log(instanceSummaries);
    expect(instanceSummaries.length).toBeGreaterThanOrEqual(1);
  });
});
