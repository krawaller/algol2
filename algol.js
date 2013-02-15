;(function(global){
	var Algol = global.Algol = {};

	/**
	 * Gathers all world content on a given position
	 * @param {Object} world A world object containing aspect objects
	 * @param {Number} ykx A ykx-styled address
	 * @return {Object} A position object
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
	 * Tests if a position object fully matches an object of props.
	 * Passes if ALL props match.
	 * @param {Object} position A position object, containing aspect names with prop objects
	 * @param {Object} objtomatch An object with aspect names and props to match
	 * @param {Object} environment An object with environment variables.
	 * @return {Boolean} True or false
	 */
	Algol.matchAll = function(position,objtomatch,environment){
		return _.all(objtomatch,function(aspecttomatch,aspectname){
			return _.all(aspecttomatch,function(proptomatch,propname){
				return this.matchProp((position[aspectname]||{})[propname],proptomatch,environment);
			},this);
		},this);
	};

	/**
	 * Tests if a position object matches an object of props.
	 * Passes if ANY prop matches.
	 * @param {Object} position A position object, containing aspect names with prop objects
	 * @param {Object} objtomatch An object with aspect names and props to match
	 * @param {Object} environment An object with environment variables.
	 * @return {Boolean} True or false
	 */
	Algol.matchAny = function(position,objtomatch,environment){
		return _.any(objtomatch,function(aspecttomatch,aspectname){
			return _.any(aspecttomatch,function(proptomatch,propname){
				return this.matchProp((position[aspectname]||{})[propname],proptomatch,environment);
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

})(window);