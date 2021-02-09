import { ElastiCache as AwsElastiCache } from '@aws-sdk/client-elasticache';

export type CacheClusterSummary = {
  id: string;
  status: string;
};

export class ElastiCache {
  private readonly elastiCache: AwsElastiCache;

  constructor(elastiCache: AwsElastiCache = new AwsElastiCache({})) {
    this.elastiCache = elastiCache;
  }

  async listCacheClusters(): Promise<CacheClusterSummary[]> {
    const cacheClusters = await this.elastiCache.describeCacheClusters({});
    return (
      cacheClusters.CacheClusters?.map(cluster => ({
        id: cluster.CacheClusterId!!,
        status: cluster.CacheClusterStatus!!,
      })) ?? []
    );
  }
}
