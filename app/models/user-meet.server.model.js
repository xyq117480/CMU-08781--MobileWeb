'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * User meet Schema
 */
var UserMeetSchema = new Schema({
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	meet: {
		type: Schema.ObjectId,
		ref: 'Meet'
	},
	minutesToDestination: {
		type: Number,
	},
	minutesToDestinationPolicy: {
		type: Number, // 0: auto-track. 1: user input
		default: 0
	},
	updated: {
		type: Date
	}
});

mongoose.model('UserMeet', UserMeetSchema);