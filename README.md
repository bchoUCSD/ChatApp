
create-react-app is only used for development purposes so we need to create the build folder in React by running a `npm run build` in client

socketIO is in two parts, a server side and a client side

noticed that upon refresh of browser the connection is refreshed with different socket id

if we want to use the socket in components must pass the first instance of socket as props

socket.io works by having a key that specifies what to receive and a payload, the payload can be anything (object, string, etc) but the server must have the same key as the client to receive the payload. The server can then emit back to the client or do something else with the payload

mongoose allows us to have semi strict data schema(design) for the database before we can actually access the database

Note: useEffect takes a snapshot of all the states before the effect goes off so setting state inside works but logging it only works after because it will just take the previous value

guide on [mongoose](https://www.mongodb.com/developer/languages/javascript/getting-started-with-mongodb-and-mongoose/)


