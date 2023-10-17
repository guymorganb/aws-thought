// setting up DynamoDB Table(s) this basically the dynamodb schema
const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-2'
})
// By specifying the API version in the preceding statement, 
// we ensure that the API library we're using is compatible with the following commands. 
// This is also the latest long-term support version, or LTS.
// It is important to note that we're using the DynamoDB class to create a service interface object, dynamodb.
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'})

// Next we'll create a params object that will hold the schema and metadata of the table, by adding the following code:
const params = {
    TableName: 'Thoughts',
    KeySchema: [
        { AttributeName: 'username', KeyType: 'HASH'}, // Partition key / determines the partition in which an item will be stored. DynamoDB distributes data across partitions
        { AttributeName: 'createdAt', KeyType: 'RANGE'}, // Sort key / The primary key element that stores items within a partition in sorted order. This is optional but allows for querying with sorting One benefit of using createdAt as the sort key is that queries will automatically sort by this value
    ],
    AttributeDefinitions:[
        { AttributeName: 'username', AttributeType: 'S' }, // String (S). string data types.
        { AttributeName: 'createdAt', AttributeType: 'N'}, // Number (N). number data types 
    ], // Represents the number of capacity units you want to provision for reads and writes. 
    ProvisionedThroughput: { // This directly affects the cost and performance of your table.
        ReadCapacityUnits: 10,  // The maximum number of reads per second. One read capacity unit represents one strongly consistent read per second, or two eventually consistent reads per second, for an item up to 4 KB in size.
        WriteCapacityUnits: 10, // he maximum number of writes per second. One write capacity unit represents one write per second for an item up to 1 KB in size.
        /**
         * Example: With ReadCapacityUnits set to 10, you could achieve up to 10 strongly consistent reads per second (or 20 eventually consistent reads). With WriteCapacityUnits set to 10, you could perform up to 10 writes per second.
         It's important to understand these fields, especially when dealing with larger applications or datasets. 
         You'll want to ensure your table is correctly set up to handle the expected traffic, and to avoid incurring unnecessary costs. Fine-tuning your DynamoDB settings, especially provisioned throughput, 
         can have a direct impact on performance and billing.
        */
    }, 
}
/**
 * Because it's a NoSQL database, DynamoDB also has access to more complex attribute types 
 * like arrays (known here as lists, or "L") and objects or dictionaries (known here as maps, or "M").
 * 
 * Notice that we only defined the keys for the Thoughts table. We didn't define any other attributes, such as the thought itself. Unlike in a relational database, the schema does not have to be predefined. 
 * Items in a DynamoDB table can have a different number of attributes, but they must have a partition key or composite key.
 */
// make a call to dynamo db to setup the table, passing the params object to dynamodb so it knows what to do
dynamodb.createTable(params,(err, data) =>{
    if(err){
        console.error(
            'Unable to create table. Error JSON:',
            JSON.stringify(err, null, 2),
        );
    } 
    else{
        console.log(
            'Created table. Table description JSON:',
            JSON.stringify(data, null ,2)
        );
    }
});