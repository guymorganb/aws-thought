const { v4: uuidv4 } = require('uuid');

/**
 * Up until now we've had access to the S3 bucket through the access keys located in .aws/credentials locally stored on the computer. 
 * These credentials were accessed by the aws-sdk package and provided authentication to the S3 and DynamoDB services. 
 * The access keys recognized us as the S3 bucket owner, which grants us access privileges to write, list, and read items in the S3 bucket.
 * Grant Access Permissions
 * 
 * To access the images in the bucket from a public URL, we'll need to grant access privileges to the S3 bucket. 
 * AWS can grant privileges in a few different ways in an S3 bucket. 
 * We can grant access to each file in the bucket or grant access to the bucket, for all the files or objects stored in the bucket.
 * To do this programmatically, we can assign an ACL (or access-control list) permission on each image file. 
 * Let's add this permission property to the imageParams object, which we configured in the params-config.js file in the server/utils folder. 
 *
 * To enable anyone with the URL address to view the images files, we must allow public read access. 
 * Navigate in the browser to the S3 console, then select the bucket name. Select the Permissions tab, then scroll down to Bucket Policy. Select Edit.
 * Enter the following JSON code with your own user-images Amazon Resource Names (ARNs) into the text editor and select Save. 
 * You can find your ARN under the Properties tab within your bucket.
 * {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        // Replace <arn:aws:s3:::user-images-16026064168/*> and <arn:aws:s3:::user-images-16026064168> with your own ARNs. Do not include the angled brackets. You will be posting the same ARN twice here but one will have a `/*` after it.
        "<arn:aws:s3:::user-images-16026064168/*>",
        "<arn:aws:s3:::user-images-16026064168>"
      ]
    }
  ]
}
 */
const params = (fileName) => {
    const myFile = fileName.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
  
    const imageParams = {
      // Replace the <My_Bucket_Name> with the name of your own S3 bucket
      Bucket: 'user-images-c783cb4d-61b4-431c-b4c0-c7cadbb2658a',
      Key: `${uuidv4()}.${fileType}`,
      Body: fileName.buffer,
      ACL: 'public-read', // we add the ACL property to the imageParams object to grant read access to this object.
    };
  
    return imageParams;
  };

  /**
   * 
In the preceding function expression, the params function receives a parameter called fileName, which this function will receive as an argument from the Express route.
Once we store the reference to the fileType, we'll declare imageParams.
We must define three properties of imageParams: the Bucket, Key, and Body properties to connect to S3.
We'll assign the Bucket with the name of the S3 bucket we created previously by replacing the <My_Bucket_Name> placeholder with the actual name of the S3 Bucket you created earlier in this lesson.
Next, assign the Key property, which is the name of this file. Use uuidv4() to ensure a unique file name. We'll also add the file extension from fileType. Then, assign the buffer property of the image to the Body property. 
This is the temporary storage container of the image file. multer removes this temporary storage space once this buffer has been used.

Pause
How will we find the images if we assign them random string values as names?
Reference to the images will be stored in DynamoDB with a reference to their URL.

All that's left is to add the module.exports expression to expose the imageParams.
   */

module.exports = params;