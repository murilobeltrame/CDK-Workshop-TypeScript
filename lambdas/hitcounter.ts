import { DynamoDB, Lambda } from "aws-sdk";

exports.handler = async (event: any) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    //CREATE AWS SDK CLIENTS
    const dynamo = new DynamoDB()
    const lambda = new Lambda()

    //UPDATE DYNAMO ENTRY FOR 'PATH' WITH HITS++
    await dynamo.updateItem({
        TableName: process.env.HITS_TABLE_NAME,
        Key: {
            path: {
                S: event.path
            }
        },
        UpdateExpression: 'ADD hits :incr',
        ExpressionAttributeValues: { ':incr': {N:'1'} }
    }).promise()

    //CALL DOWNSTREAM FUNCTION AND CAPTURE RESPONSE
    const resp = await lambda.invoke({
        FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
        Payload: JSON.stringify(event)
    }).promise()

    console.log('downstream response:', JSON.stringify(resp, undefined, 2));

    return JSON.parse(resp.Payload?.toString() || '');
}