;(function(global){
	var Algol = global.Algol = {};


/*€€€€€€€€€€€€€€€€€€€€€€€€€€€ Q U E R Y   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

	/**
	 * Gathers all world content on a given position
	 * @param {Object} world A world object containing aspect objects
	 * @param {Number} ykx A ykx-styled address
	 * @return {Object} A place object
	 */
	Algol.getWorldPosition = function(world,ykx){
		return _.reduce(world,function(pos,aspect,aspectname){
			return _.extend(pos,_.object([aspectname],[aspect[ykx] || {}]));
		},{TYPE:"POSITION"});
	};

	/**
	 * Tests a single propvalue towards wanted value and environment.
	 * Used in matchAll, matchAny
	 * @param {Value} prop The value we want to test
	 * @param {Value} proptomatch The value we want. Can also be an environment property name
	 * @param {Object} environment An object with environment variables.
	 * @return {Boolean} True or false
	 */
	Algol.matchProp = function(prop,proptomatch,environment){
		return prop === proptomatch || proptomatch === environment[prop];
	};

	/**
	 * Tests if a place object fully matches an object of props.
	 * Passes if ALL props match.
	 * @param {Object} place A place object, containing aspect names with prop objects
	 * @param {Object} objtomatch An object with aspect names and props to match
	 * @param {Object} environment An object with environment variables.
	 * @return {Boolean} True or false
	 */
	Algol.matchAll = function(place,objtomatch,environment){
		return _.all(objtomatch,function(aspecttomatch,aspectname){
			return _.all(aspecttomatch,function(proptomatch,propname){
				return this.matchProp((place[aspectname]||{})[propname],proptomatch,environment);
			},this);
		},this);
	};

	/**
	 * Tests if a place object matches an object of props.
	 * Passes if ANY prop matches.
	 * @param {Object} place A place object, containing aspect names with prop objects
	 * @param {Object} objtomatch An object with aspect names and props to match
	 * @param {Object} environment An object with environment variables.
	 * @return {Boolean} True or false
	 */
	Algol.matchAny = function(place,objtomatch,environment){
		return _.any(objtomatch,function(aspecttomatch,aspectname){
			return _.any(aspecttomatch,function(proptomatch,propname){
				return this.matchProp((place[aspectname]||{})[propname],proptomatch,environment);
			},this);
		},this);
	};

	/**
	 * Resolves a condition test. Used in the ifElse function.
	 * @param {Object} objtotest An object with aspects of properties to test
	 * @param {Object} condition An object with props test and against
	 * @returns {Boolean} True or false, given by the test function
	 */
	Algol.resolve = function(objtotest,condition,environment){
		return this[condition.test](objtotest,condition.against,environment);
	};

	/**
	 * Returns the (ifelseprocessed) then or else prop in ifelse obj defending on its if prop
	 * @param {Object} objtotest An object with aspects of properties to test
	 * @param {Object} ifelse An ifelse definition, or a pure value which will be returned
	 * @param {Object} environment An object with environment variables
	 * @returns {Object} The then or else props of the ifelse, or the ifelse itself it not an actual ifelse.
	 */
	Algol.ifElse = function(objtotest,ifelse,environment){
		return ifelse.TYPE === "IFELSE" ? this.ifElse(objtotest, (this.resolve(objtotest,ifelse.iftest,environment) ? ifelse.then : ifelse.otherwise), environment) : ifelse;
	};


/*€€€€€€€€€€€€€€€€€€€€€€€€€€€ B O A R D  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

	/**
	 * Finds a new position on the board
	 * @param {Object} pos A position object with x and y props
	 * @param {Number} dir The direction in which to walk
	 * @param {Number} forward How many steps to take forward
	 * @param {Number} right How many steps to take right
	 * @param {Object} board The board definition
	 * @returns {Object} A new position object
	 */
	Algol.moveInDir = function(pos,dir,forward,right,board){
		var x = pos.x, y = pos.y;
		switch((board || {}).shape){
			default:
				switch(dir){
					case 2: return {x: x+forward+right, y: y-forward+right};
					case 3: return {x: x+forward, y: y+right};
					case 4: return {x: x+forward-right, y: y+forward+right};
					case 5: return {x: x-right, y: y+forward};
					case 6: return {x: x-forward-right, y: y+forward-right};
					case 7: return {x: x-forward, y: y-right};
					case 8: return {x: x-forward+right, y: y-forward-right};
					default: return {x: x+right, y: y-forward};
				}
		}
	};

	/**
	 * Calculates a new direction, relative to another
	 * @param {Number} dir The relative direction you want to face
	 * @param {Number} relativeTo The direction you're turning relative to
	 * @returns {Number} The new direction
	 */
	Algol.dirRelativeTo = function(dir,relativeto,board){
		switch((board || {}).shape){
			default: return [1,2,3,4,5,6,7,8,1,2,3,4,5,6,7,8][relativeto-2+dir];
		}
	};


	/**
	 * Tests whether or not a given squares is within board bounds
	 * Used by artifactgenerator utility functions
	 * @param {Object} pos Coordinates of position to test
	 * @param {Object} board Object of board dimensions and shape
	 * @return {Boolean} whether or not the position is within bounds
	 */
	Algol.isOnBoard = function(pos,board){
		switch((board || {}).shape){
			default: return pos.x > 0 && pos.x <= board.x && pos.y>0 && pos.y <= board.y;
		}
	};

})(window);