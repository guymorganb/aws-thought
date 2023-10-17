const { v4: uuidv4 } = require('uuid');


const params = (fileName) => {
    const myFile = fileName.originalname.split('.');
    const fileType = myFile[myFile.length - 1];
  
    const imageParams = {
      // Replace the <My_Bucket_Name> with the name of your own S3 bucket
      Bucket: 'user-images-c783cb4d-61b4-431c-b4c0-c7cadbb2658a',
      Key: `${uuidv4()}.${fileType}`,
      Body: fileName.buffer,
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