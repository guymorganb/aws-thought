/**
 * we create a S3 bucket to store static files after we set up the database
 */

// Load the AWS SDK for Node.js This package is responsible for the API that allows the application to communicate with the web service.
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid')

// Set the region The region must be updated to communicate with the web service.
AWS.config.update({ region: 'us-east-2' });

// Create S3 service object The preceding expression creates the s3 instance object with the designated API. 
// By specifying the API version, we ensure that the API library we're using is compatible with the following commands.
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Next, create the bucketParams object that assigns the metadata of the bucket (such as the bucket name) by adding the following code:
var bucketParams = {  // 
    Bucket: 'user-images-c783cb4d-61b4-431c-b4c0-c7cadbb2658a', //'user-images-' + uuidv4(),
    PublicAccessBlockConfiguration: {
        // Set BlockPublicAcls and IgnorePublicAcls to false to allow public access via ACLs
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        
        // Depending on your needs, adjust the below values accordingly
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
};
var Params = {  // for creating a new bucket
    Bucket: 'user-images-' + uuidv4(),
    
};


// call S3 to create the bucket, Now we'll call the s3 instance object to create an S3 bucket using the bucketParams—by adding the following code:
// Use a callback function with the createBucket method and the bucketParams object to create an S3 bucket.
// creates the bucket
s3.createBucket(Params, (err, data) =>{
    if(err){
        console.log('Error', err)
    }
    else {
        console.log('Success')
    }
})
// set the bucket permissions
s3.putPublicAccessBlock(bucketParams, (err, data) => {
    if (err) {
      console.log(err, err.stack);  // Error information
    } else {
      console.log(data);            // Successful response
    }
  });

// ccli commands: 
// npm install aws-sdk uuid
// node create-bucket.js
// consider migrating to sdk(v3) for javascript. https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrating-to-v3.html

/** We'll be creating a local DynamoDB instance for the development stage
 * 
 * Several databases are often used in conjunction with a company's back-end application. 
 * This way, the specialized abilities of a relational database can be used in 
 * combination with the scalability and performance of a DynamoDB database. 
 * This hybrid approach is a way to load balance for performance.
 */