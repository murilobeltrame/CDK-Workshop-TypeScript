// import * as sns from '@aws-cdk/aws-sns';
// import * as subs from '@aws-cdk/aws-sns-subscriptions';
// import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core'
import * as lambda from "@aws-cdk/aws-lambda"
import * as apigateway from "@aws-cdk/aws-apigateway"
import { TableViewer } from "cdk-dynamo-table-viewer";
import { HitCounterConstruct } from './hit-counter-construct';

export class CdkWorkshopTsStack extends cdk.Stack {

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const queue = new sqs.Queue(this, 'CdkWorkshopTsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // const topic = new sns.Topic(this, 'CdkWorkshopTsTopic');

    // topic.addSubscription(new subs.SqsSubscription(queue));    

    //DEFINES AN AWS LAMBDA RESOURCE
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lambdas'),
      handler: 'hello.handler'
    })

    const helloHitCounter = new HitCounterConstruct(this, 'HelloHitCounter', {
      downstream: hello
    })

    //DEFINES AN API GATEWAY REST API RESOURCE BACKED BY OUT 'HELLO' FUNCTION
    new apigateway.LambdaRestApi(this, 'Endpoint', {
      handler: helloHitCounter.handler
    })

    new TableViewer(this, 'TableHitCounter', {
      title: 'Hello Hits',
      table: helloHitCounter.table
    })

  }
}
