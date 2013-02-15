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
		for(var aspectname in objtomatch){
			var aspect = position[aspectname],
				aspecttomatch = objtomatch[aspectname] || {};
			for(var propname in aspecttomatch){
				if (!this.matchProp(aspect[propname],aspecttomatch[propname],environment)){
					return false;
				}
			}
		}
		return true;
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
		for(var aspectname in objtomatch){
			var aspect = position[aspectname],
				aspecttomatch = objtomatch[aspectname] || {};
			for(var propname in aspecttomatch){
				if (this.matchProp(aspect[propname],aspecttomatch[propname],environment)){
					return true;
				}
			}
		}
		return false;
	};


})(window);