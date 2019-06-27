// Import the required dependencies 
const app = require("express")();
const http = require("http").Server(app);
// The require('socket.io')(http) creates a new socket.io instance attached to the http server.
// http server is passed as argument 
const io = require("socket.io")(http);
const mongoose = require("mongoose");
let users = [];
let messages = [];

// This is the default port which MongoDB users, chatapp is the name of our Database
// This is a database inside of MongoDB Server
mongoose.connect("mongodb://localhost:27017/chatapptwo");

// Schemas define how the 'collection' (analogous to tables) in MongoDB should be
const ChatSchema = mongoose.Schema({
	username: String, // The username is stored as a string
	msg: String	// Message is stored as string
});

// A model is how we actually save the Database, Like a collection
// Pass the 'collection table name' and pass the ChatSchema as well

// When the server loads, Set the above empty users and messages array to all the messages that are there in ChatModel
const ChatModel = mongoose.model("chat", ChatSchema);

// 
ChatModel.find((err, result) => {
	if (err) throw err; // No error handling, Directly throw error
	messages = result;
});

// The io.on event handler handles connection, disconnection, etc., events in it, using the socket object.
io.on("connection", socket => {
	socket.emit('loggedIn', {
		users: users.map(s => s.username),
		messages: messages
	});

	socket.on('newuser', username => {
		console.log(`${username} has arrived at the Chat Room`);
		socket.username = username;

		users.push(socket);

		io.emit('userOnline', socket.username);
	});

	socket.on('msg', msg => {
		// When we did not use Database, message was equal to an object
		let message = new ChatModel({
			username: socket.username,
			msg: msg
		});

		message.save((err, result) => {
			if (err) throw err;
			messages.push(result);
			io.emit('msg', result);
		});
	});

	// Disconnect
	socket.on("disconnect", () => {
		console.log(`${socket.username} has left the party.`);
		io.emit("userLeft", socket.username);
		users.splice(users.indexOf(socket), 1);
	});
});

http.listen(process.env.PORT || 3000, () => {
	console.log("Listening on port %s", process.env.PORT || 3000);
});

/**
 * npm run dev (in chat-app folder)
 * rpm run serve (in chat-app/client)
 */
