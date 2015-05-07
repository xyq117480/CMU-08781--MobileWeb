'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Place Schema
 */
var PlaceSchema = new Schema({
	yelpId: {
		type: String,
		required: 'Please fill Place ID'
	},
	name: {
		type: String,
		default: '',
		trim: true
	},
	latitude: {
		type: Number,
		default: 0,
		trim: true
	},
	longitude:{
		type: Number,
		default: 0,
		trim: true
	},
	description:{
		type: String,
		default: '',
		trim: true
	},
	image_url:{
		type: String,
		default: ''
	},
	rating_img_url:{
		type: String,
		default: ''
	},
	mobile_url:{
		type: String,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Place', PlaceSchema);