# graphql-vis-network

Application that uses apollo to fetch and vis-network to show and edit a graph.
This started as a small editor now it was changed to simulate ( in a really simplified way ) a process.

How to run:

Install:

    - First run `npm install``
    - Install and run arangoDB 
    - The command to start the frontend project also compiles the TS for the backend so first:
        - `npm run start` to compile and run the frontend
        - `npm run serve` to run the backend ( if no arangoDB service is running this will receive a "connect ECONNREFUSED 127.0.0.1:8529" error )
    - The frontend end can be seem in http://localhost:4000


 ( I don't recommend using firefox for this. It gets really slow due to the rerendering done as we update data in the backend )
