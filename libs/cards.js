'use strict';
var response = require('./response'),
    mongoose = require('./db').mongoose,
    db = require('./db').db,
    Schema = mongoose.Schema,
    config = require("./config"),
    ObjectId = Schema.ObjectId;

var CardSchema = new Schema
(
  { memberid:
    { type: Schema.Types.ObjectId
    , ref: 'members'
    }
  , cardtype: String
  , cardid: String
  }
)
var Card = db.model
( 'cards'
, CardSchema
, 'cards'
)


var addCard = function(req, res) {
		var card = req.body;
		card.cardid = convertCardToHex(card.cardid);
    Card.forge()
		.save(card)
		.then(function(card){
            console.log(card)
            var apiServiceResponse = response.createResponse({msg: 'success', cardID: card.id})
            response.respondToClient(res, {format: config.app.stockResponse}, apiServiceResponse);
		})
		.otherwise(function(err){
            console.log(err)
            var apiServiceResponse = response.createResponse({msg: 'failed', err: err.clientError}, true);
            response.respondToClient(res, {format: config.app.stockResponse}, apiServiceResponse);
		})
}

var removeCard = function(req, res) {
	var cardID = req.params.id;
    console.log(cardID)
    new Card({id: cardID})
        .fetch()
        .then(function(card){
            console.log("The card, id: " + card.id)
            card.on('destroyed', function(){
                console.log('Card Destroyed')
            })
            card.on('destroying', function(something){
                console.log('Destroying ' + something.id);
            })
            card
                .destroy()
                .then(function(){
                    var apiServiceResponse = response.createResponse({msg: 'success'});
                    response.respondToClient(res, {format: 'json'}, apiServiceResponse);
                })
                .otherwise(function(err){
                    console.log(err)
                })
		});
}

var convertCardToHex = function(card){
	var convertedCard = Number(card).toString(16);
	if(convertedCard.length < 4) {
		convertedCard = '??0' + convertedCard;
	} else {
		convertedCard = '??' + convertedCard;
	}
	return convertedCard;
}

module.exports =
{ Card: Card
, CardSchema: CardSchema
, addCard: addCard
, removeCard: removeCard
};
