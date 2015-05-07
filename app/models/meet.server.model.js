'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Meet Schema
 */
var MeetSchema = new Schema({
	place: {
		type: Schema.ObjectId,
		ref: 'Place'
	},
	created: {
		type: Date,
		default: Date.now
	},
	host: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	invite: [
		{
			type: Schema.ObjectId,
			ref: 'User'
		}
	],
	isPublic: {
		// 0 means private, 1 means visible to friends, 2 means public
		type: Number, 
		default: 0
	},
	meetTime: {
		type: Date
	}

});

mongoose.model('Meet', MeetSchema);