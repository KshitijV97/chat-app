<template>
	<div id="app">
		<div class="header">
			<h1>ChatRoom</h1>
			<p class="username">Username: {{ username }}</p>
			<p class="online">Online: {{ users.length }}</p>
		</div>
		<ChatRoom v-bind:messages="messages" v-on:sendMessage="this.sendMessage" />
	</div>
</template>

<script>
import io from 'socket.io-client';
import ChatRoom from './components/ChatRoom';

export default {
	name: 'app',
	components: {
		ChatRoom
	},
	// a component’s data option must be a function
	data: function () {
		return {
			username: "",
			socket: io("http://localhost:3000"), // Initializing, Connecting to the server
			messages: [],
			users: []
		}
	},
	methods: {
		joinServer: function () {
			this.socket.on('loggedIn', data => {
			// DONT write a function here else the scope of following 'this' changes
        	//this is related to component and not to Function
			this.messages = data.messages;  // Show the new user existing messages
			this.users = data.users; // Show the new user list of existing users
			this.socket.emit('newuser', this.username); // Pass the username for others to see
			});

			this.listen();
		},
		listen: function () {
			this.socket.on('userOnline', user => {
				this.users.push(user);
			});
			this.socket.on('userLeft', user => {
				this.users.splice(this.users.indexOf(user), 1);
			});
			this.socket.on('msg', message => {
				this.messages.push(message);
			});
		},
		sendMessage: function (message) {
			this.socket.emit('msg', message);
		}
	},
	mounted: function () {
		this.username = prompt("What is your username?", "Anonymous");

		if (!this.username) {
			this.username = "Anonymous";
		}

		this.joinServer();
	}
}
</script>

<style lang="scss">
body {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	color: #2C3E50;
	margin: 0;
	padding: 0;
}

#app {
	display: flex;
	flex-direction: column;
	height: 100vh;
	width: 100%;
	max-width: 768px;
	margin: 0 auto;
	padding: 15px;
	box-sizing: border-box;
}
</style>
