var mongoose = require("mongoose");
var Item = require("./models/item");
var Comment = require("./models/comment");

var data = [
	{
	 	name: "Humidifier", 
	 	image: "https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1545012313-414dUxTXWUL.jpg",
	 	description: "Stay wet and moist moist",
		price: "15"
	},
	{
	 	name: "Portable heater", 
	 	image: "https://i.ebayimg.com/images/g/Vh4AAOSwp5lePBH3/s-l640.jpg",
	 	description: "Stay hot and warm",
		price: "8"
	},
	{
	 	name: "Airpods", 
	 	image: "https://cdn.shoplightspeed.com/shops/607644/files/12963200/900x900x2/apple-apple-airpods-2nd-gen-w-wireless-charging-ca.jpg",
	 	description: "Works perfectly fine and brand new",
		price: "100"
	}
]

function seedDB(){
	Item.remove({}, function(err){
		// if(err) {
		// 	console.log(err);
		// }
		// console.log("removed item")
		// // add a few items
		// data.forEach(function(seed){
		// 	Item.create(seed, function(err, item){
		// 		if(err) {
		// 			console.log(err);
		// 		} else {
		// 			console.log("added an item");
		// 			// Create a comment
		// 			Comment.create(
		// 				{
		// 					text: "This is useful!",
		// 					author: "Anonymous"
		// 				}, function(err, comment){
		// 					if(err) {
		// 						console.log(err);
		// 					} else {
		// 						console.log("Created new comment");
		// 						item.comments.push(comment);
		// 						item.save();
		// 					}
		// 				});
		// 		}	
		// 	});
		// });
	});
}

module.exports = seedDB;