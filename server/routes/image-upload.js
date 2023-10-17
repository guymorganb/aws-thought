const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const paramsConfig = require('../utils/params-config');

// How does S3 get the access keys to provide web service permission?
// The aws-sdk package retrieves this information from the local folder, ~/.aws/credentials, where we stored the access id key and private key information with the AWS CLI.

//With multer we'll create a temporary storage container that will hold the image files until it is ready to be uploaded to the S3 bucket
const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
      callback(null, '');
    },
});

// declare the upload object, which contains the storage destination and the key, image
// use the preceding function, upload, to store the image data from the form data received by the POST route. 
// We'll use the single method to define that this upload function will receive only one image. We'll also define the key of the image object as image.
// image is the key!
const upload = multer({ storage }).single('image');

// instantiate the service object, s3, to communicate with the S3 web service, which will allow us to upload the image to the S3 bucket, lock the version number as a precautionary measure in case the default S3 version changes
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
  });

  // Create the Image Upload Route
  // endpoint will be located at localhost:3000/api/image-upload. We'll use a POST method to securely transfer the request body. 
  // We include the upload function as the second argument to define the key and storage destination. 
  // In the route's function block we need to configure params, so that the S3 will know the bucket name as well as the image's file name.
  /** 
   * Endpoint
   * localhost:3001/api/image-upload
   */
  router.post('/image-upload', upload, (req, res) => {
    // set up params config
    const params = paramsConfig(req.file);
    // set up S3 service call, use the s3 service interface object we instantiated previously with the aws-sdk package to call the upload() method
    s3.upload(params, (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }
        res.json(data);
      });
  });
  module.exports = router;