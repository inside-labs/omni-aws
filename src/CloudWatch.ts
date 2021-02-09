import { CloudWatch as AwsCloudWatch, MetricDataQuery, StandardUnit } from '@aws-sdk/client-cloudwatch';

export type GetCloudWatchMetricInput = {
  id: string;
  metricName: string;
  namespace: string;
  resolution: number;
  statistic: 'SampleCount' | 'Average' | 'Sum' | 'Minimum' | 'Maximum';
};

export type MetricDataPoint = {
  timestamp: Date;
  value: number;
};

export type CloudWatchMetric = {
  name: string;
  dataPoints: MetricDataPoint[];
};

export class CloudWatch {
  private readonly cloudWatch: AwsCloudWatch;

  constructor(cloudWatch: AwsCloudWatch = new AwsCloudWatch({})) {
    this.cloudWatch = cloudWatch;
  }

  async triggerMetric(namespace: string, name: string, value: number, unit: StandardUnit, resolution: 1 | 60) {
    await this.cloudWatch.putMetricData({
      Namespace: namespace,
      MetricData: [
        {
          MetricName: name,
          Value: value,
          Unit: unit,
          StorageResolution: resolution,
        },
      ],
    });
  }

  async batchTriggerMetric(
    namespace: string,
    name: string,
    values: number[],
    unit: StandardUnit,
    resolution?: 1 | 60,
    timestamp?: Date
  ) {
    await this.cloudWatch.putMetricData({
      Namespace: namespace,
      MetricData: [
        {
          MetricName: name,
          Values: values,
          Unit: unit,
          StorageResolution: resolution,
          Timestamp: timestamp,
        },
      ],
    });
  }

  async getMetrics(metrics: GetCloudWatchMetricInput[], startTime: Date, endTime: Date): Promise<CloudWatchMetric[]> {
    const queries: MetricDataQuery[] = metrics.map(metric => ({
      Id: metric.id,
      MetricStat: {
        Metric: {
          MetricName: metric.metricName,
          Namespace: metric.namespace,
        },
        Period: metric.resolution,
        Stat: metric.statistic,
      },
      ReturnData: true,
    }));
    const metricsResponse = await this.cloudWatch.getMetricData({
      MetricDataQueries: queries,
      StartTime: startTime,

      EndTime: endTime,
    });
    return (
      metricsResponse.MetricDataResults?.map(result => {
        const dataPoints: MetricDataPoint[] = [];
        for (let i = 0; i < result.Timestamps!!.length; i++) {
          dataPoints.push({
            timestamp: result.Timestamps!![i],
            value: result.Values!![i],
          });
        }
        return {
          name: result.Id!!,
          dataPoints: dataPoints,
        };
      }) ?? []
    );
  }
}
