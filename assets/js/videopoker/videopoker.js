/*
Video Poker
By Colby King
*/


var POKER = POKER || {};

POKER.RANKS = POKER.RANKS || {
	TWO: 2,
	THREE: 3,
	FOUR: 4,
	FIVE: 5,
	SIX: 6,
	SEVEN: 7,
	EIGHT: 8,
	NINE: 9,
	TEN: 10,
	JACK: 11,
	QUEEN: 12,
	KING: 13,
	ACE: 14
}


POKER.Deck = POKER.Deck || (function() {

	// ---- static variables ----- //

	var DECK_SIZE = 52;
	var NUM_VALUES = 13;
	var NUM_SUITES = 4;


	return function(config){
		// ---- public variables ---- //
		var _this = this;
		_this.suits = ['diamonds', 'hearts', 'clubs', 'spades'];
		_this.values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
		_this.deck = [];


		// ---- Private methods ---- //
		function initializeDeck(){
			for(var i = 0; i < NUM_SUITES; i++){
				for(var j = 0; j < NUM_VALUES; j++){
					_this.deck.push({
						suit: _this.suits[i],
						value: _this.values[j]
					});
				}
			}
		}

	    /**
		 * Shuffles an array in place. Adaptation of the 
		 * Fisher-Yates algorithm 
		 */
		function shuffle(){
			var i = _this.deck.length - 1;
			var tmp, j;
			for(;i > 0; i--){
				j = Math.floor(Math.random() * (i+1));
				tmp = _this.deck[i];
				_this.deck[i] = _this.deck[j];
				_this.deck[j] = tmp;
			}
		}
		function display(){
			for(var i = 0; i < _this.deck.length; i++){
				console.log(_this.deck[i].suit + ' ' + _this.deck[i].value)
			}
		}

		// ***** pubic methods ****** //

		_this.deal = function(howMany){
			var dealt = 0,
				cards = [];
			while(dealt < howMany){
				cards.push(_this.deck.pop())
				dealt++;
			}
			return cards;
		}

		initializeDeck();
		shuffle();
	}

})();

POKER.HandAnalyzer = POKER.HandAnalyzer || (function(){

	return function(cards){
		var _this = this;
		this.cards = cards;
		this.rankCount = {};
		
		for(var i = 0; i < cards.length; i++){
			if(this.rankCount[cards[i].value] === undefined){
				this.rankCount[cards[i].value] = 1;
			} else {
				this.rankCount[cards[i].value]++;
			}
		}

		function pairCount(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 2){
					pairCount++;
				}
			}
			return pairCount;
		}

		function highestRank(){
			var ranks = Object.keys(_this.rankCount);
			return Math.max(...ranks);
		}

		function lowestRank(){
			var ranks = Object.keys(_this.rankCount);
			return Math.min(...ranks);
		}

		function evalJacksOrBetter(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 2 && rank >= POKER.RANKS.JACK){
					pairCount++;
				}
			}
			if(pairCount === 1) return true;
			return false;
		}

		function evalTwoPair(){
			return pairCount() === 2;
		}

		function evalThreeOfAKind(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 3) return true;
			}
			return false;
		}

		function evalStraight(){
			var handranks = Object.keys(_this.rankCount);
			//if(handranks.length < 5) return false;
			var straight = [];
			for(var i = 0; i < handranks.length; i++){
				straight[handranks[i]] = handranks[i]
				if(handranks[i] == POKER.RANKS.ACE){
					straight[1] = "1";
				}
			}
			// Find start of straight
			var index = lowestRank();

			if(lowestRank() === POKER.RANKS.TWO &&
			   highestRank() === POKER.RANKS.ACE){
				index--;
			}

			// Count adjacent cards
			var adjCards = 0;
			while(straight[index] !== undefined && adjCards < 5){
				adjCards++;
				index++;
			}
			return adjCards === 5;
		}

		function evalFlush(){
			var suit = _this.cards[0].suit;
			for(var i = 1; i < _this.cards.length; i++){
				if(_this.cards[i].suit !== suit) return false;
			}
			return true;
		}

		function evalFullHouse(){
			return evalThreeOfAKind() && pairCount() === 1;
		}

		function evalFourOfAKind(){
			var pairCount = 0;
			for(const rank in _this.rankCount){
				if(_this.rankCount[rank] === 4) return true;
			}
			return false;
		}

		function evalStraightFlush(){
			return evalStraight() && evalFlush();
		}

		function evalRoyalFlush(){
			return (evalStraight() && evalFlush() && lowestRank() === POKER.RANKS.TEN);
		}

		this.evaluate = function(){
			var handEvaluation = {
				"ROYAL FLUSH": evalRoyalFlush,
				"STRAIGHT FLUSH": evalStraightFlush,
				"FOUR OF A KIND": evalFourOfAKind,
				"FULL HOUSE": evalFullHouse,
				"FLUSH": evalFlush,
				"STRAIGHT": evalStraight,
				"THREE OF A KIND": evalThreeOfAKind,
				"TWO PAIR": evalTwoPair,
				"JACKS OR BETTER": evalJacksOrBetter
			};
	
			for(const hand in handEvaluation){
				evalFunction = handEvaluation[hand];
				var made = evalFunction();
				if(made){
					return {
						handMade: hand,
						payout: POKER.Payout.JACKS_OR_BETTER[hand],
					};
				}
			}
			return {
				hand: null,
				payout: 0
			};
		}
	}

})();

POKER.Hand = POKER.Hand || (function(){

	return function(config, cards){
		var _this = this;
		_this.config = config;
		_this.cards = cards;
		_this.holdIndexes = [];

		this.draw = async function(handsize, deck){
			//Return promise with this function. 
			var heldCards = [];
			for(var i = 0; i < _this.holdIndexes.length; i++){
				heldCards.push(_this.cards[_this.holdIndexes[i]]);
			}
			var cards = deck.deal(handsize - heldCards.length);
			
			//Updated all cards not held 
			for(var i = 0, j = 0; i < _this.cards.length; i++){
				if(!_this.holdIndexes.includes(i)){
					_this.cards[i] = cards[j];
					j++;
				}
			}

			await _this.updateCardContainer();
			clearHoldLabels();
		}

		function dealCard(index){
			return new Promise(function(resolve, reject){
				setTimeout(() => {
					updateCardImg(index, _this.cards[index]);
					resolve(index);
				}, 75);
			});
		}


		this.logHandToConsole = function(){
			for(var i = 0; i < _this.cards.length; i++){
				console.log(cardToString(_this.cards[i]));
			}
		}

		function cardToString(card){
			var rankString;
			switch(card.value){
				case 11:
					rankString = "Jack";
					break;
				case 12: 
					rankString = "Queen";
					break;
				case 13:
					rankString = "King";
					break;
				case 14:
					rankString = "Ace";
					break;
				default:
					rankString = card.value.toString();

			}
			return `${rankString} Of ${card.suit}`;
		}

		function updateCardImg(index, card){
			var cardDivs = document.getElementsByClassName("card");
			var cardToUpdate = cardDivs[index];
			var cardImg = cardToUpdate.getElementsByTagName("img")[0];
			var scriptPath = _this.config.scriptLocation.pathname;
			cardImg.src = `${scriptPath}assets/cards/${card.value}_of_${card.suit}.png`;
			cardDivs[index].onclick = handleCardHold(index);
			return cardDivs[index];
		}

		function clearHoldLabels(){
			var cardDivs = document.querySelectorAll(".card");
			for(var i = 0; i < cardDivs.length; i++){
				setHoldLabelVisibility(cardDivs[i], "hidden");
			}
			_this.holdIndexes = [];
		}

		function setHoldLabelVisibility(cardDiv, visibility){
			cardDiv.firstElementChild.style.visibility = visibility;
		}

		function holdCard(index){
			var cards = document.querySelectorAll(".card");
			if(_this.holdIndexes.includes(index)){
				var i = _this.holdIndexes.indexOf(index);
				_this.holdIndexes.splice(i, 1);
				cards[index].firstElementChild.style.visibility = "hidden";
			} else {
				_this.holdIndexes.push(index);
				cards[index].firstElementChild.style.visibility = "visible";
			}
		}

		function handleCardHold(index){
			return function(e){
				holdCard(index);
			}
		}

		this.updateCardContainer = async function(){

			for(let i = 0; i < _this.cards.length; i++){
				while(_this.holdIndexes.includes(i) && i < _this.cards.length-1) i++;
				await dealCard(i);
			}
		}
	}

})();


POKER.Payout = POKER.Payout || (function(){
	var JACKS_OR_BETTER = {
		"ROYAL FLUSH": 250,
		"STRAIGHT FLUSH": 50,
		"FOUR OF A KIND": 25,
		"FULL HOUSE": 9,
		"FLUSH": 6,
		"STRAIGHT": 4,
		"THREE OF A KIND": 3,
		"TWO PAIR": 2,
		"JACKS OR BETTER": 1
	};

	return {
		JACKS_OR_BETTER: JACKS_OR_BETTER
	}

})();

POKER.PayTable = POKER.PayTable || (function(){
	 MAX_COLUMN = 6;
	 START_COLUMN = 1;
	 BET_TO_COL_OFFSET = 1;
	 PAYTABLE_HANDINDEX = {
	 	"ROYAL FLUSH": 0,
	 	"STRAIGHT FLUSH": 1,
	 	"FOUR OF A KIND": 2,
	 	"FULL HOUSE": 3,
	 	"FLUSH": 4,
	 	"STRAIGHT": 5,
	 	"THREE OF A KIND": 6,
	 	"TWO PAIR": 7,
	 	"JACKS OR BETTER": 8
	 };

	return function(config, container){
		
		var _this = this;
		_this.container = container;

		function createPayTable(){
			// Initialize table
			var payTable = document.createElement("table");
			payTable.className = "pay-table";
			var payTableBody = document.createElement("tbody")
			payTableBody.id = "pay-table-body"
			payTable.appendChild(payTableBody);
			return payTable;
		}


		function initialize(){
			var paytable = createPayTable();
			var paytableBody = paytable.firstElementChild;
			var MAX_BET = 5
			for(const payout in POKER.Payout.JACKS_OR_BETTER){
				var row = document.createElement("tr");
				var handMadeCol = document.createElement("td");
				handMadeCol.innerText = payout;
				handMadeCol.className = "left-align";
				row.appendChild(handMadeCol);

				for(var i = 1; i <= MAX_BET; i++){
					var payCol = document.createElement("td");
					payCol.className = "payout-value";
					payCol.innerText = (POKER.Payout.JACKS_OR_BETTER[payout] * i);
					row.appendChild(payCol);
				}
				paytableBody.appendChild(row);
			}
			var component = document.createElement("div")
			component.className = "game-component";
			component.appendChild(paytable)
			_this.container.appendChild(component);
		}

		this.displayBet = async function(bet, decrementCredits){
			// Clear last column from last hand
			var COLUMN_INDEX = bet + BET_TO_COL_OFFSET;
			colorPaytableColumn(COLUMN_INDEX, 'rgb(20,42,79)');

			var startCol = 2;
			for(var i = startCol; i < startCol + bet; i++){
				await animatePaytableClimb(i);
				decrementCredits()
			}

		}

		this.increaseBet = function(bet){
			colorPaytableColumn(START_COLUMN + bet, 'red');
			if(bet > 1){
				colorPaytableColumn(START_COLUMN + bet - 1, 'rgb(20,42,79)')
			} else {
				colorPaytableColumn(MAX_COLUMN, 'rgb(20,42,79)')
			}
		}

		this.highlightPaytableHand = function(handResult){
			_this.clearPaytableHighlight();
			if(handResult.handMade){
				var index = PAYTABLE_HANDINDEX[handResult.handMade];
				var columnCells = document.querySelectorAll("#pay-table-body tr > td:first-child");
				for(var i = 0; i < columnCells.length; i++){
					columnCells[i].style.color = 'rgb(254,255,55)';
				}
				console.log('index:' + index);

				columnCells[index].style.color = 'white';
				columnCells[index].style.fontWeight = 'bold';
			}
		}


		this.clearPaytableHighlight = function(){
			var columnCells = document.querySelectorAll("#pay-table-body tr > td:first-child");
			for(var i = 0; i < columnCells.length; i++){
					columnCells[i].style.color = 'rgb(254,255,55)';
					columnCells[i].style.fontWeight = 'normal';
			}
		}


		function colorPaytableColumn(col, color, textColor){
			var columnCells = document.querySelectorAll(`#pay-table-body tr > td:nth-child(${col})`);
			for(var i = 0; i < columnCells.length; i++){
				columnCells[i].style.backgroundColor = color;
				if(textColor){
					columnCells[i].style.color = textColor;
				}
			}

		}

		function animatePaytableClimb(col){
			return new Promise(function(resolve, reject){
				setTimeout(() => {
					var columnCells = document.querySelectorAll(`#pay-table-body tr > td:nth-child(${col})`);
					if(col > 2){
						colorPaytableColumn(col - 1, 'rgb(20,42,79)')
					}
					colorPaytableColumn(col, 'red');
					resolve(columnCells);
				}, 100);
			});
		}


		initialize();

	}

})();

POKER.Player = POKER.Player || (function(){

	DEFAULT_CREDITS = 100;
	DEFAULT_BET = 0;
	MAX_BET = 5;


	return function(config, container, paytable){
		var _this = this;
		var onDraw = false;
		_this.config = config;
		_this.currentBet = DEFAULT_BET;
		_this.container = container;
		_this.paytable = paytable;
		_this.credits = DEFAULT_CREDITS;
		_this.creditsLabel, _this.betLabel, _this.hand, _this.deck, _this.paytable;

		BUTTONS = [
			{label: "OFF", id: 'off-button', action: null},
			{label: "MORE GAMES", id: 'more-games-button', action: null},
			{label: "LOG", id: 'log-button', action: null},
			{label: "BET ONE", id: 'bet-one-button', action: handleBetIncrease},
			{label: "BET MAX", id: 'bet-max-button', action: handleMaxBet},
			{label: "DEAL", id: 'deal-button', action: playGame}
		]


		function initializePlayerInfo(){
			var component = document.createElement("div")
			component.className = "game-component";
			var playInfo = document.createElement("div");
			playInfo.className = "play-info";
			var betLabel = document.createElement("div");
			betLabel.className = "game-text";
			betLabel.id = "bet-label";
			_this.betLabel = betLabel;
			var creditsLabel = document.createElement("div");
			creditsLabel.className = "game-text float-right";
			creditsLabel.id = "credit-label";
			_this.creditsLabel = creditsLabel;
			playInfo.appendChild(betLabel);
			playInfo.appendChild(creditsLabel);
			component.appendChild(playInfo);
			_this.container.appendChild(component);
		}

		function initializeButtonBar(){
			var component = document.createElement("div")
			component.className = "game-component";
			var buttonBar = document.createElement("div");
			buttonBar.className = "button-bar";
			buttonBar.id = "button-bar";
			for(var i = 0; i < BUTTONS.length; i++){
				var button = document.createElement("button");
				button.innerHTML = BUTTONS[i].label;
				button.id = BUTTONS[i].id;
				button.onclick = BUTTONS[i].action;
				buttonBar.appendChild(button);
			}
			component.appendChild(buttonBar);
			var buttonBar = document.getElementById('button-bar')
			_this.container.appendChild(component);
		}

		function initialize(){
			initializePlayerInfo();
			initializeButtonBar();
			_this.creditsLabel.innerHTML = DEFAULT_CREDITS;
			_this.betLabel.innerHTML = DEFAULT_BET;
			_this.betLabel.onclick = handleBetIncrease;
		}

		function handleMaxBet(){
			_this.currentBet = MAX_BET;
			_this.betLabel.innerHTML = _this.currentBet;
			playGame();
		}

		function handleBetIncrease(){
			if(_this.currentBet < MAX_BET){
				_this.currentBet += 1;
				_this.betLabel.innerHTML = _this.currentBet;
				_this.paytable.increaseBet(_this.currentBet);
			} else {
				_this.currentBet = 1;
				_this.betLabel.innerHTML = _this.currentBet;
				_this.paytable.increaseBet(_this.currentBet);
			}
		}

		this.registerWinnings = async function(payout){
			_this.credits += (payout * _this.currentBet);
			for(var i = 0; i < payout * _this.currentBet; i++){
				await incrementCreditLabel();
			}
		}

		this.placeBet = async function(){
			// Case where player selects draw without betting 
			if(_this.currentBet === 0){
				_this.currentBet = 1;
				_this.paytable.increaseBet(_this.currentBet);
			} 
			_this.credits -= _this.currentBet;
			await _this.paytable.displayBet(_this.currentBet, decrementCreditLabel);
		}

		function incrementCreditLabel(){
			return new Promise(function(resolve, reject){
				setTimeout(() => {
					var currentCredit = _this.creditsLabel.innerHTML;
					_this.creditsLabel.innerHTML = parseInt(currentCredit) + 1;
					resolve();
				}, 50);
			});
		}

		function decrementCreditLabel(){
			var currentCredit = _this.creditsLabel.innerHTML;
			_this.creditsLabel.innerHTML = parseInt(currentCredit) - 1;
		}

		function displayHandResults(handResults, gameOver){
			var handLabel = document.getElementById("winning-hand-label");

			if(gameOver){
				handLabel.classList.remove("info");
				if(handResults.handMade){
					handLabel.innerHTML = handResults.handMade
				} else {
					handLabel.innerHTML = "GAME OVER"
				}
			} else {
				handLabel.classList.add("info");
				if(handResults.handMade){
					console.log('setting label');
					handLabel.innerHTML = handResults.handMade;
				}
			}
		}

		function resetCardDisplay(){
			var cardContainer = document.getElementsByClassName('cards')[0];
			var cardImages = cardContainer.getElementsByTagName('img');
			var scriptPath = _this.config.scriptLocation.pathname;
			for(var i = 0; i < cardImages.length; i++){
				cardImages[i].src = `${scriptPath}assets/cards/back@2x.png`;
			}
		}

		function resetHoldLabels(){
			var cardContainer = document.getElementsByClassName('cards')[0];
			var holdLabels = cardContainer.getElementsByClassName('hold');
			for(var i = 0; i < holdLabels.length; i++) {
				holdLabels[i].style.visibility = 'hidden';
			}
		}

		function resetWinningHandLabel(){
			var winLabel = document.getElementById('winning-hand-label');
			winLabel.innerHTML = "";
		}

		function resetGame(){
			resetCardDisplay();
			resetHoldLabels();
			resetWinningHandLabel();
			_this.paytable.clearPaytableHighlight();

		}

		function playGame(){
			if(!onDraw){
				resetGame();
				_this.deck = new POKER.Deck(_this.config);
				_this.hand = new POKER.Hand(_this.config, _this.deck.deal(5));
				_this.placeBet()
				.then(function(){
					_this.hand.updateCardContainer();
				})
				.then(function(){
					var ha = new POKER.HandAnalyzer(_this.hand.cards);
					var handResult = ha.evaluate();
					_this.paytable.highlightPaytableHand(handResult);
					displayHandResults(handResult, onDraw);
					onDraw = true;
				});
			} else {
				_this.hand.draw(5, _this.deck)
				.then(function(){
					var ha = new POKER.HandAnalyzer(_this.hand.cards);
					var handResult = ha.evaluate();
					_this.paytable.highlightPaytableHand(handResult);
					displayHandResults(handResult, onDraw);
					onDraw = false;
					_this.registerWinnings(handResult.payout);
				});
			}
		}
		initialize();
	}
})();

POKER.Game = POKER.GAME || (function(){

	var FIVE_CARD_DRAW = 5;
	var _this = this;
	_this.config;


	function createComponentContainer(){
		var componentContainer = document.createElement("div")
		componentContainer.className = "component-container";
		return componentContainer;
	}

	function createGameComponent(){
		var componentContainer = document.createElement("div")
		componentContainer.className = "game-component";
		return componentContainer;
	}

	
	function createFlippedCardElement(){
		var cardElem = document.createElement("div");
		cardElem.className = "card"

		var holdLabel = document.createElement("div");
		holdLabel.className = "hold";

		var cardImg = document.createElement("img");
		var scriptPath = _this.config.scriptLocation.pathname;
		cardImg.src = `${scriptPath}assets/cards/back@2x.png`;
		cardElem.appendChild(holdLabel);
		cardElem.appendChild(cardImg);
		return cardElem;
	}

	function createCardDisplay(){
		var component = createGameComponent();
		var cardContainer = document.createElement("div")
		cardContainer.className = "cards";
		component.appendChild(createGameOverLabel());
		component.appendChild(cardContainer);

		for(var i = 0; i < FIVE_CARD_DRAW; i++){
			var c = createFlippedCardElement();
			var index = i;
			cardContainer.appendChild(c);
		}

		return component;

	}

	function createGameOverLabel(){
		var winningHandLabel = document.createElement("div");
		winningHandLabel.className = "game-text text-center";
		winningHandLabel.id = "winning-hand-label";
		winningHandLabel.style.minHeight = "30px";
		winningHandLabel.style.marginBottom = "10px";
		return winningHandLabel;

	}

	function getLocationOfThisScript(){
	    var scripts = document.querySelectorAll( 'script[src]' );
	    var currentScript = scripts[ scripts.length - 1 ].src;
	    var currentScriptChunks = currentScript.split( '/' );
	    var currentScriptFile = currentScriptChunks[ currentScriptChunks.length - 1 ];
	    return new URL(currentScript.replace( currentScriptFile, '' ));
	}

	function start(config){
		_this.config = config;
		_this.config.scriptLocation = getLocationOfThisScript();
		console.log(_this.config.scriptLocation);
		var gameContainer = document.getElementById(config['board']);
		var componentContainer = createComponentContainer();
		var cardContainer = createCardDisplay();
		gameContainer.appendChild(componentContainer);
		_this.paytable = new POKER.PayTable(config, componentContainer, _this);
		componentContainer.appendChild(cardContainer);
		_this.player = new POKER.Player(config, componentContainer, _this.paytable);
	}

	return {
		start: start
	}

})();


