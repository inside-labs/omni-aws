import { RDS as AwsRDS } from 'aws-sdk';

export type RdsClusterSummary = {
  id: string;
  endpoint: string;
  status: string;
};
export type RdsInstanceStatusInfo = {
  statusType: string;
  /**
   * Boolean value that is true if the instance is operating normally, or false if the instance is in an error state.
   */
  ok: boolean;
  /**
   * Status of the DB instance. For a StatusType of read replica, the values can be replicating, replication stop point set, replication stop point reached, error, stopped, or terminated.
   */
  status: string;
  /**
   * Details of the error if there is an error for the instance. If the instance isn't in an error state, this value is blank.
   */
  message?: string;
};
export type RdsInstanceSummary = {
  id: string;
  endpoint: string;
  readReplicaStatusInfos?: RdsInstanceStatusInfo[];
  engine: string;
};

export class RDS {
  private readonly rds: AwsRDS;

  constructor(rds: AwsRDS = new AwsRDS()) {
    this.rds = rds;
  }

  async listInstances(): Promise<RdsInstanceSummary[]> {
    const instances = await this.rds.describeDBInstances().promise();
    return (
      instances.DBInstances?.map(instance => ({
        endpoint: instance.Endpoint?.Address!!,
        id: instance.DBInstanceIdentifier!!,
        engine: instance.Engine!!,
        readReplicaInfos: instance.StatusInfos?.map(statusInfo => ({
          statusType: statusInfo.StatusType!!,
          ok: statusInfo.Normal!!,
          status: statusInfo.Status!!,
          message: statusInfo.Message,
        })),
      })) ?? []
    );
  }

  async listClusters(): Promise<RdsClusterSummary[]> {
    const dbs = await this.rds.describeDBClusters().promise();
    return (
      dbs.DBClusters?.map(cluster => ({
        id: cluster.DBClusterIdentifier!!,
        endpoint: cluster.Endpoint!!,
        status: cluster.Status!!,
      })) ?? []
    );
  }
}
