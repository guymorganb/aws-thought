const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk')

const awsConfig = {
    region: 'us-east-2',
};
AWS.config.update(awsConfig);
// Why did we not lock the version number for the DocumentClient class like we did for the DynamoDB class?
// While DynamoDB class had two versions, DocumentClient has only one, so there is no need to lock the version number for DocumentClient.
const dynamodb = new AWS.DynamoDB.DocumentClient(); // connect with the local DynamoDB instance. We use the DocumentClient class to use native JavaScript objects to interface with the dynamodb service object.
const table = 'Thoughts'

/**
 * Endpoint
 * Development: localhost:3001/api/users
*/ 
router.get('/users', (req, res) =>{
    const params = {
        TableName: table,
    };
    // Next, we'll pass the params object into the DynamoDB call, as follows:
    // Scan return all items in the table
    dynamodb.scan(params, (err, data) =>{
        if(err){
            res.status(500).json(err); // an error occured
        }
        // The data in the table is actually in the Items property of the response, so data.Items was returned.
        else{
            res.json(data.Items);
        }
    })
})

/**
 * ex: localhost:3001/api/users/Ray%20Davis
 * Endpoint
 * Development: localhost:3001/api/users:param
*/ 
router.get('/users/:username', (req, res) => {
    console.log(`Querying for thought(s) from ${req.params.username}.`);
    const params = {
        TableName: table,
        //   we can use expressions by using comparison operators such as <, =, <=, and BETWEEN to find a range of values.
        KeyConditionExpression: '#un = :user',  //  KeyConditionExpression property specifies the search criteria. Similar to the WHERE clause in SQL, the KeyConditionExpression property is used to filter the query with an expression
        // #un represents the attribute value, 'username'. This is defined in the ExpressionAttributeNames property. While attribute name aliases have the # prefix, the actual value of this key is up to us.
        // reserved words from DynamoDB that can't be used as attribute names in the KeyConditionExpression. Because words such as time, date, user, and data can't be used, 
        // abbreviations or aliases can be used in their place as long as the symbol # precedes it.
        ExpressionAttributeNames: {
            '#un': 'username',
            '#ca': 'createdAt',
            '#th': 'thought',
            '#img': 'image'
        },
        ExpressionAttributeValues: {
            ':user': req.params.username,
            // attribute values can also have an alias, which is preceded by the : symbol. 
            // The attribute values also have a property that defines the alias relationship. 
            // In this case, the ExpressionAttributeValues property is assigned to req.params.username, 
            // which was received from the client. To reiterate, we're using the username selected by the 
            // user in the client to determine the condition of the search. This way, the user will decide which username to query.
        },
        ProjectionExpression: '#un, #th, #ca, #img', // the ProjectExpression property determines which attributes or columns will be returned.
        ScanIndexForward: false,
        // The default setting is true, which specifies the order for the sort key, which will be ascending. 
        // The sort key was assigned to the createdAt attribute when we first created the table. 
        // Because we want the most recent posts on top, we set the ScanIndexForward property to false so that the order is descending.
    }// end of params
    // database call
    dynamodb.query(params,(err, data) =>{
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            res.status(500).json(err); // an error occurred
          } else {
            console.log("Query succeeded.");
            res.json(data.Items)    // The response data from the database is located in the Items property of the response.
          }
    });
}); // closes the route for router.get(users/:username)

/**
 * Create new user at /api/users
 * Endpoint [POST]
 * Development: localhost:3001/api/users
*/
router.post('/users', (req, res) => {
    const params = {
      TableName: table,
      Item: {
        username: req.body.username,
        createdAt: Date.now(),  // we used the createdAt property as the sort key, which will help us sort the thoughts chronologically when we want to render them in the profile page.
        thought: req.body.thought,
        image: req.body.image // we'll modify the /api/users POST route so that the image attribute 'Location' will be added to the src attribute in the <img> element when created in DynamoDB
      },
    };
    // database call
    dynamodb.put(params, (err, data) => {   // use the put method to add an item to the Thoughts tables
        if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(500).json(err); // an error occurred
        } else {
          console.log("Added item:", JSON.stringify(data, null, 2));
          res.json({"Added": JSON.stringify(data, null, 2)});
        }
      });
});  // ends the route for router.post('/users')


// add the following expression to expose the endpoints:
module.exports = router;

// One way to check is to use the following AWS CLI command, which will return the contents of the table in the command line:

// CLI
// aws dynamodb scan --table-name Thoughts