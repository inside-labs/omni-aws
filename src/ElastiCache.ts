import { ElastiCache as AwsElasticCache } from 'aws-sdk';

export type CacheClusterSummary = {
  id: string;
  status: string;
};

export class ElastiCache {
  private readonly elastiCache: AwsElasticCache;

  constructor(elastiCache: AwsElasticCache = new AwsElasticCache()) {
    this.elastiCache = elastiCache;
  }

  async listCacheClusters(): Promise<CacheClusterSummary[]> {
    const cacheClusters = await this.elastiCache.describeCacheClusters().promise();
    return (
      cacheClusters.CacheClusters?.map(cluster => ({
        id: cluster.CacheClusterId!!,
        status: cluster.CacheClusterStatus!!,
      })) ?? []
    );
  }
}
