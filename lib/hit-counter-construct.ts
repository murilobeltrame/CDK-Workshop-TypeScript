import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export interface HitCounterConstructProperties {
    downstream: lambda.IFunction
}

export class HitCounterConstruct extends cdk.Construct {

    //ALLOWS ACESSING THE COUNTER FUNCTION
    public readonly handler: lambda.Function;

    //THE HITCOUNTER TABLE
    public readonly table: dynamodb.Table;

    constructor(scope: cdk.Construct, id: string, properties: HitCounterConstructProperties) {
        super(scope, id)

        this.table = new dynamodb.Table(this, 'Hits', {
            partitionKey: {
                name: 'path',
                type: dynamodb.AttributeType.STRING
            }
        })

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.asset('lambdas'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: properties.downstream.functionName,
                HITS_TABLE_NAME: this.table.tableName
            }
        })

        //GRANT THE LAMBDA ROLE READ/WRITE  PERMISSIONS TO OUR TABLE
        this.table.grantReadWriteData(this.handler)

        //GRANT THE LAMBDA ROLE INVOKE PERMISSIONS TO THE DOWNSTREAM FUNCTION
        properties.downstream.grantInvoke(this.handler)
    }
}