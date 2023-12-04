# Rumeez Backend

This project is available at the [Rumeez backend](https://github.com/Rumeez/Rumeez_backend) GitHub.

## Setup

To begin with, run

`npm install`

In order to run the backend with its full functionality, there must be a MongoDB server listening at `localhost:27017`. As our production database is running on an AWS instance, you must run the command

`ssh -L 27017:127.0.0.1:27017 ubuntu@18.216.253.226`

to forward your local 27017 port to that of the remote. To run this command, you will need to contact the system administrator, [Andrea Baretta](andrea.m.baretta@gmail.com), to set up your SSH credentials with the server.

Once the server is listening at 

## Available Scripts

To run a dev build, run

`npm run dev`

or

`npx ts-node-dev src/index.ts`

To build and run a production build, call

`npm run build`
`npm start`