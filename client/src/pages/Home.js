import React, { useState, useEffect } from 'react';
import ThoughtList from '../components/ThoughtList';
import ThoughtForm from '../components/ThoughtForm';

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thoughts, setThoughts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try { // It's a good idea to use a try...catch block in case the web service call doesn't work.
        const res = await fetch('/api/users');
        const jsonData = await res.json();
        const _data = jsonData.sort((a, b) => // Because the database call uses the scan method, we must sort the data ourselves, which we accomplish by using the sort method. We could also apply the sort operation in the server to offload processing to the cloud instead of the client.
          a.createdAt < b.createdAt ? 1 : -1,
        );
        setThoughts([..._data]);
        setIsLoaded(true);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <main>
      <div className="flex-row justify-space-between">
        <div className="col-12 mb-3">
          <ThoughtForm />
        </div>
        <div className={`col-12 mb-3 `}>
          {!isLoaded ? (
            <div>Loading...</div>
          ) : (
              <ThoughtList thoughts={thoughts} setThoughts={setThoughts} title="Some Feed for Thought(s)..." />
            )}
        </div>
      </div>
    </main>
  );
};

export default Home;
