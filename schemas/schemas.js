var Schema = require('mongoose').Schema

module.exports = {
  	User: new Schema({
		friendList: {
			type: Array
		},
		meetList: {
			type: Array
		},
		firstName: {
			type: String
		},
		lastName: {
			type: String
		},
		displayName: {
			type: String
		},
		email: {
			type: String
		},
		username: {
			type: String
		},
		password: {
			type: String
		},
		salt: {
			type: String
		},
		updated: {
			type: Date
		},
		created: {
			type: Date
		}
	}),
	Place: new Schema({
		name: {
			type: String
		},
		latitude: {
			type: Number
		},
		longitude:{
			type: Number
		},
		description:{
			type: String
		},
		created: {
			type: Date
		}
	}),
	Meet: new Schema({
		place: {
			type: Schema.ObjectId,
			ref: 'Place'
		},
		created: {
			type: Date
		},
		host: {
			type: Schema.ObjectId,
			ref: 'User'
		},
		invite: {
			type: Array
		},
		isPublic: {
			type: Boolean
		},
		meetTime: {
			type: Date
		}
	})
}