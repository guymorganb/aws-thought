import React, { useState, useRef } from 'react';

const ThoughtForm = () => {
  const [formState, setFormState] = useState({
    username: "",
    thought: "",
  });
  const [characterCount, setCharacterCount] = useState(0);
  const fileInput = useRef(null);
  // update state based on form input changes
  const handleChange = (event) => {
    if (event.target.value.length <= 280) {
      setFormState({ ...formState, [event.target.name]: event.target.value });
      setCharacterCount(event.target.value.length);
    }
  };

  // we declare the handleImageLoad function. We assigned this function to invoke when the user selects the Upload button for the <input type="file"> element. 
  // We want this function to retrieve the image file uploaded by the user and send this data in a request to the image upload endpoint that we created previously.
  const handleImageUpload = (event) => {
    event.preventDefault();
    console.log("upload button clicked")
    const data = new FormData();  // form data is an interface
    data.append('image', fileInput.current.files[0]);
    // send image file to endpoint with the postImage function
    // Because the image upload process to S3 is an asynchronous request that will take some time, 
    // it's possible to submit the form before the response from the image upload process is returned. 
    // This will submit a null as the value of the image URL. 
    // To prevent this, we can add a progress bar or disable the form submit button while the image is processing.
    // Next, declare an interface object from FormData, called data. FormData makes it easy to construct a set of key-value pairs, 
    // mirroring the format of a form with the type set to "multipart/form-data".
    // Assign a Key-Value Pair
    // In the next statement, we assign a key-value pair to the FormData object with the name of the image file (image) and the payload (the image file). 
    // We assign the reference to the image file with fileInput.current.files[0]. If multiple files were uploaded at once, the files array would be sent.
    // The postImage function sends the configured FormData object, data, to the upload image endpoint. 
    // We'll declare the following function in the handleImageLoad
    const postImage = async () => { //// add a loading spinner
      try {
        const res = await fetch('/api/image-upload', {
          mode: 'cors',
          method: 'POST',
          body: data,
        });
        if (!res.ok) throw new Error(res.statusText);
        const postResponse = await res.json();
        setFormState({ ...formState, image: postResponse.Location });
        console.log('postImage: ', postResponse.Location);
        return postResponse.Location;
      } catch (error) {
        console.log(error);
      }
    };
    postImage();
    // Once we receive a response from the image upload endpoint, we convert the response into a JSON object, so that we can add this new key-value to formState. 
    // This new key-value pair is { image: postResponse.Location }, 
    // which is the public URL of the image. It was a good idea to place this request in a try...catch block to track any unsuccessful S3 calls.
  };
  // submit form
  const handleFormSubmit = (event) => {
    event.preventDefault();

    const postData = async () => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      console.log(data);
    };
    postData();
    
    // clear form value
    setFormState({ username: "", thought: "" });
    setCharacterCount(0);
  };

  return (
    <div>
      <p className={`m-0 ${characterCount === 280 ? "text-error" : ""}`}>
        Character Count: {characterCount}/280
      </p>
      <form
        className="flex-row justify-center justify-space-between-md align-stretch"
        onSubmit={handleFormSubmit}
      >
        <input
          placeholder="Name"
          name="username"
          value={formState.username}
          className="form-input col-12 "
          onChange={handleChange}
        ></input>
        <textarea
          placeholder="Here's a new thought..."
          name="thought"
          value={formState.thought}
          className="form-input col-12 "
          onChange={handleChange}
        ></textarea>
  
        {/* Image upload section */}
        <label className="form-input col-12 p-1">
          Add an image to your thought:
          <input
            type="file"
            ref={fileInput} // make sure fileInput is properly defined
            className="form-input p-2"
          />
          <button
            className="btn"
            onClick={handleImageUpload} // make sure handleImageUpload is properly defined
            type="button" // use type button to avoid form submission
          >
            Upload
          </button>
        </label>
  
        <button className="btn col-12 " type="submit">
          Submit
        </button>
      </form>
    </div>
  );
  
};

export default ThoughtForm;
