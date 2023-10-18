const AWS = require('aws-sdk');
const iam = new AWS.IAM();
const ec2 = new AWS.EC2({ region: 'us-east-2' });
const fs = require('fs');
/**
* Steps
0) Create the key pair and save it to a file.
1) Create the IAM policy that provides access to S3 and DynamoDB.
2) Create an IAM role suitable for EC2 instances.
3) Attach the policy to the role.
4) Define storage configurations for the EC2 instance.
5) Create and set up a security group for the EC2 instance.
6) Launch the EC2 instance with the defined IAM role and security group.
*/
// Define the policy document that will grant access to S3 and DynamoDB.
const policyDocument = {
    Version: "2012-10-17",
    Statement: [
        {
            Sid: "DescribeQueryScanBooksTable",
            Effect: "Allow",
            Action: "dynamodb:*",
            Resource: "*"
        },
        {
            Effect: "Allow",
            Action: "s3:*",
            Resource: "*"
        }
    ]
};

async function createKeyPairAndSaveToFile() {
    const keyPair = await ec2.createKeyPair({
        KeyName: 'aws-thought'
    }).promise();
    console.log('Created key pair:', keyPair.KeyName);
    fs.writeFileSync('./aws-thought.pem', keyPair.KeyMaterial);
    console.log('Saved private key to aws-thought.pem');
}

async function createAndAttachRole() {
    try {
        // 0. Create the key pair and save it to a file.
          await createKeyPairAndSaveToFile();
        // 1. Create an IAM policy with the specified permissions.
        const policy = await iam.createPolicy({
            PolicyName: 'S3-DynamoDB',
            PolicyDocument: JSON.stringify(policyDocument)
        }).promise();
        console.log('Created policy:', policy.Policy.Arn);

        // 2. Define the trust relationship for the new role. This allows EC2 to assume this role.
        const trustRelationship = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: {
                        Service: "ec2.amazonaws.com"
                    },
                    Action: "sts:AssumeRole"
                }
            ]
        };

        // Create the IAM role with the specified trust relationship.
        const role = await iam.createRole({
            RoleName: 'S3-DynamoDB',
            AssumeRolePolicyDocument: JSON.stringify(trustRelationship)
        }).promise();
        console.log('Created role:', role.Role.Arn);

        // 3. Attach the previously created policy to the newly created role.
        await iam.attachRolePolicy({
            RoleName: 'S3-DynamoDB',
            PolicyArn: policy.Policy.Arn
        }).promise();
        console.log('Attached policy to role.');
        
        // Create the IAM instance profile.
        const instanceProfile = await iam.createInstanceProfile({
            InstanceProfileName: 'S3-DynamoDB-Profile'
        }).promise();
        console.log('Created instance profile:', instanceProfile.InstanceProfile.Arn);
        
        // Add the role to the instance profile.
        await iam.addRoleToInstanceProfile({
            InstanceProfileName: 'S3-DynamoDB-Profile',
            RoleName: 'S3-DynamoDB'
        }).promise();
        console.log('Added role to instance profile.');
        await new Promise(resolve => setTimeout(resolve, 15000)); // run this timeout to allow time for the instanceProfileName to be created, or youll get errors
                // Define the storage configurations. We'll use the default settings.
                const blockDeviceMappings = [{
                    DeviceName: '/dev/sda1',
                    Ebs: {
                        VolumeSize: 8, // Default size is 8 GiB
                        VolumeType: 'gp2', // General Purpose SSD
                    }
                }];
        
                // Define the security group configuration.
                const secGroup = await ec2.createSecurityGroup({
                    Description: 'Security group for EC2 instance',
                    GroupName: 'launch-wizard-1'
                }).promise();
                console.log('Created security group:', secGroup.GroupId);
        
                // Define inbound rules for the security group.
                await ec2.authorizeSecurityGroupIngress({
                    GroupId: secGroup.GroupId,
                    IpPermissions: [
                        // Allow SSH
                        {
                            IpProtocol: 'tcp',
                            FromPort: 22,
                            ToPort: 22,
                            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
                        },
                        // Allow HTTPS
                        {
                            IpProtocol: 'tcp',
                            FromPort: 443,
                            ToPort: 443,
                            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
                        },
                        // Allow HTTP
                        {
                            IpProtocol: 'tcp',
                            FromPort: 80,
                            ToPort: 80,
                            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
                        }
                    ]
                }).promise();
                console.log('Configured security group rules.');

        // 4. Launch an EC2 instance and associate the IAM role with it.
         // Define the parameters to launch the EC2 instance.
         const launchParams = {
            ImageId: 'ami-024e6efaf93d85776', // Ubuntu-Server-20.04
            InstanceType: 't2.micro',
            MinCount: 1,
            MaxCount: 1,
            IamInstanceProfile: {
                Name: 'S3-DynamoDB-Profile'
            },
            BlockDeviceMappings: blockDeviceMappings,
            SecurityGroupIds: [secGroup.GroupId],
            KeyName: 'aws-thought'  // This assumes the key pair 'aws-thought' exists or is created before this call.
        };

        const instanceData = await ec2.runInstances(launchParams).promise();
        console.log("Created instance with IAM role:", instanceData.Instances[0].InstanceId);
        
    } catch (err) {
        // Handle any errors that occur during the execution.
        console.error(err);
    }
}

// Execute the main function to create the role, policy, and launch the EC2 instance.
createAndAttachRole();


// Configuration for terminating the EC2 instance
// const terminateParams = {
//     InstanceIds: [instanceId]
// };

// Terminate the launched EC2 instance
// const terminateData = await ec2.terminateInstances(terminateParams).promise();
// console.log("Terminated instance", instanceId);
        
// If later you decide you want to delete this .pem file, you'll need to first reset the permissions on the file by using the following:

// Copy
// icacls.exe aws-thought.pem /reset
