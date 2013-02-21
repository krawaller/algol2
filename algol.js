;(function(global){
	var Algol = global.Algol = {};

/*€€€€€€€€€€€€€€€€€€€€ U N D E R S C O R E   E X T E N S I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

_.merge = function(collection,maker,memo,context){
	if (context) { maker = _.bind(maker,context); }
	return _.reduce(collection,function(memo,item,key){
		return _.extend(memo,maker(item,key,collection) || {});
	},memo,context);
};

_.toArray = function(o){ return o != undefined ? _.isArray(o) ? o : [o] : []; };

/*€€€€€€€€€€€€€€€€€€€€€€€€€€€ Q U E R Y   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

	/**
	 * Gathers all world content on a given position
	 * @param {Object} world A world object containing aspect objects
	 * @param {Number} ykx A ykx-styled address
	 * @return {Object} A place object
	 */
	Algol.getWorldPlaceByYkx = function(world,ykx){
		/*return _.merge(world,function(aspect,aspectname){
			return _.object([aspectname],[aspect[ykx] || {}]);
		},_.extend({TYPE:"PLACE"},this.ykxToPos(ykx)));*/
		return _.reduce(world,function(pos,aspect,aspectname){
			return _.extend(pos,_.object([aspectname],[aspect[ykx] || {}]));
		},_.extend({TYPE:"PLACE"},this.ykxToPos(ykx)));
	};

	/**
	 * Tests a single propvalue towards wanted value.
	 * If proptomatch is a NOT test, it will call itself and return inverted result.
	 * If proptomatch is an OR test, will return true if any of those are true.
	 * If proptomatch is an ENV test, it will call itself on corresponding environment variable.
	 * Used in matchAll, matchAny
	 * @param {Value} prop The value we want to test
	 * @param {Value} proptomatch The value we want. Can also be an environment property name
	 * @param {Object} environment An object with environment variables.
	 * @return {Boolean} True or false
	 */
	Algol.matchProp = function(prop,proptomatch,environment){
		switch((proptomatch || {}).TYPE){
			case "NOT": return !this.matchProp(prop,proptomatch.value,environment);
			case "OR": return _.any(proptomatch.values,function(propval){return this.matchProp(prop,propval,environment);},this);
			case "ENV": return this.matchProp(prop,environment[proptomatch.value],environment);
			default: return prop === proptomatch;
		}
	};

	/*
	 * @param {Object or Array} aspect
	 *
	 */
	Algol.matchAllPropsInAspect = function(placeaspectarr,aspecttomatch,environment){
		return _.any(_.toArray(placeaspectarr),function(placeaspect){
			return _.all(aspecttomatch,function(proptomatch,propname){
				return this.matchProp(placeaspect[propname],proptomatch,environment);
			},this);
		},this);
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
			return this.matchAllPropsInAspect(place[aspectname],aspecttomatch,environment);
		},this);
			/*return _.any(_.toArray(place[aspectname]),function(placeaspect){
				return _.all(aspecttomatch,function(proptomatch,propname){
					return this.matchProp(placeaspect[propname],proptomatch,environment);
				},this);
			},this);*/
		//},this);
	};

	/**
	 * Tests if a place object matches an object of props.
	 * Passes if ANY propmatch is successfull.
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


	/**
	 * Finds all places in the world that matches
	 * @param {Object} world A collection of aspects
	 * @param {Object} placetomatch A place object to match against
	 * @param {Object} environment An object with environment variables
	 * @param {Array} addresses An array of potential addresses
	 * @returns {Array} An array of matching addresses
	 */
	Algol.findMatchingPlaceAddresses = function(world,placetomatch,environment,addresses){
		return _.filter(addresses,function(addr){
			return this.matchAll(this.getWorldPlaceByYkx(world,addr),placetomatch,environment);
		},this);
	};


/*€€€€€€€€€€€€€€€€€€€€€€€€€€€ B O A R D  F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

	/**
	 * Finds a new position on the board
	 * @param {Object} pos A position object with x and y props
	 * @param {Number} dir The direction in which to walk
	 * @param {Object} instruction Object with forward and right prop
	 * @param {Object} board The board definition
	 * @returns {Object} A new position object
	 */
	Algol.moveInDir = function(pos,dir,instruction,board){
		var x = pos.x, y = pos.y, forward = instruction.forward, right = instruction.right;
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
	Algol.outOfBounds = function(pos,board){
		switch((board || {}).shape){
			default: return pos.x > 0 && pos.x <= board.x && pos.y>0 && pos.y <= board.y;
		}
	};

	/**
	 * Converts coordinates into a ykx number
	 * @params {Object} pos Coordinates to convert
	 * @returns {Number} A ykx number of the coordinates
	 */
	Algol.posToYkx = function(pos){ return pos.y*1000+pos.x; };

	/**
	 * Converts ykx number into coordinates
	 * @params {Number} ykx A ykx number to convert
	 * @returns {Object} A position object with x and y props
	 */
	Algol.ykxToPos = function(ykx){ return {y:Math.floor(ykx/1000),x:ykx%1000}; };


	/**
	 * Takes a board definition and returns obj for each pos, with colours and coords
	 * @params {Object} board A board definition
	 * @returns {Object} An aspect object
	 */
	Algol.generateBoardSquares = function(board){
		switch((board || {}).shape){
			default: return _.reduce(_.range(1,board.x*board.y+1),function(ret,num){
				var y = Math.floor((num-1)/board.x)+1, x = num-((y-1)*board.x);
				return _.extend(ret,_.object([this.posToYkx({x:x,y:y})],[{ y: y, x: x, colour: ["white","black"][(x+(y%2))%2] }]));
			},{},this);
		}
	};

/*€€€€€€€€€€€€€€€€€€€€€€€€€€€ G E N E R A T O R   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

	/**
	 * Tries to offset from pos into all given dirs. Won't include outofbounds results.
	 * @param {Object} def An object defining the offset. Here we use the forward and right props.
	 * @param {Object} startpos A location object with x and y coords of starting position.
	 * @param {Array} dirs An array of direction numbers to offset in.
	 * @param {Object} board The board definition, used to check out of bounds for generated squares.
	 * @returns {Object} ykx object of all generated positions, each containing dir.
	 */
	Algol.offsetInDirs = function(def,startpos,dirs,board){
		return _.reduce(dirs,function(ret,dir){
			var newpos = this.moveInDir(startpos,dir,def,board);
			return this.outOfBounds(newpos,board) ? _.extend(ret,_.object([this.posToYkx(newpos)],[{DIR:dir}])) : ret;
		},{},this);
	};

	/**
	 * Determines if the walk should stop for any reason. Used in walkInDir
	 * @param {Object} pos The position object for where we are currently at
	 * @param {Number} distance How far we've currently walked
	 * @param {Number} max Maximum allowed length, if any
	 * @param {Object} stops A ykx object of squares to stop at, if any
	 * @param {Object} steps A ykx object of squares we can walk on, if any.
	 * @param {Object} board The board definition
	 * @returns {String} Reason to stop, or undefined if no reason
	 */
	Algol.walkCheck = function(pos,distance,max,stops,steps,board){
		if (max && distance > max) return "exceededmax";
		if (this.outOfBounds(pos,board)) return "outofbounds";
		var ykx = this.posToYkx(pos);
		if (stops && stops[ykx]) return "hitstop";
		if (steps && !steps[ykx]) return "nostep";
	};

	/**
	 * Walks in the given dir, creating step/stop squares accordingly. Used in walkInDirs
	 * @param {Object} def The walk definition
	 * @param {Object} startpos The x-y position to start from
	 * @param {Number} dir The direction to walk in
	 * @param {Object} stops A ykx object of stops, if any
	 * @param {Object} steps A ykx object of steps, if any
	 * @param {Object} board The board definition
	 * @returns {Object}
	 */
	Algol.walkInDir = function(def,startpos,dir,stops,steps,board){
		var pos = startpos, instr = {forward:1}, stopstate, distance = 0, sqrs = [];
		while (!(stopstate = this.walkCheck((pos = this.moveInDir(pos,dir,instr,board)),++distance,def.max,stops,steps,board) )){
			if (def.drawatstep) { sqrs.push(_.extend({WALKKIND:"walkstep",WALKDISTANCE:distance},pos)); }
		}
		if (def.drawatstop && stopstate !== "outofbounds" && distance++) { sqrs.push(_.extend({WALKKIND:"walkstop",WALKDISTANCE:distance-1},pos)); }
		return _.reduce(sqrs,function(ret,sqr){
			return _.extend(ret,_.object([this.posToYkx(sqr)],[_.extend({DIR:dir,WALKLENGTH: distance-1, WALKSTOPREASON: stopstate},sqr)]));
		},{},this);
	};

	/**
	 * Executes walkInDir for all given directions
	 * @param {Object} def The walk definition
	 * @param {Object} startpos The x-y position to start from
	 * @param {Array} dirs All directions to walk in
	 * @param {Object} stops A ykx object of stops, if any
	 * @param {Object} steps A ykx object of steps, if any
	 * @param {Object} board The board definition
	 * @returns {Object}
	 */
	Algol.walkInDirs = function(def,startpos,dirs,stops,steps,board){
		return _.reduce(dirs,function(ret,dir){
			return _.extend(ret,this.walkInDir(def,startpos,dir,stops,steps,board));
		},{},this);
	};


/*€€€€€€€€€€€€€€€€€€€€€€€€€€€ T I M E   F U N C T I O N S €€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€€*/

	/**
	 * Calculates property state at a given time according to startvalue and changes
	 * @param {Number|String} startvalue
	 * @param {Array} changes List of changes, each change is [step,value]
	 * @param {Number} step
	 * @return {Number|String} Value at given time
	 */
	Algol.calcPropVal = function(startvalue,changes,step){
		if (!changes){ return startvalue; } // no change, return startval
		if ((!step) || step > changes[changes.length-1][0]){ return changes[changes.length-1][1]; } // no time given or time after last change, return last change value
		if (step < changes[0][0]){ return startvalue; } // time prior to first change, return start val
		return _.find(changes.slice().reverse(),function(change){ return change[0] <= step; })[1]; // last change val before step
	};

	/**
	 * Calculates startvalues and changes for a single object into a given time state
	 * Used only by calcCollection
	 * @param {Object} startproperties Starting object
	 * @param {Object} changes Per property changes
	 * @param {Number} step Which step to calculate to
	 * @param {String} fname internal shit
	 * @return {Object} Stepstate object
	 */
	Algol.calcObj = function(starts,changes,step,fname){
		return !changes ? starts : _.reduce(_.union(_.keys(starts),_.keys(changes)),function(memo,key){
			return _.extend(_.object([key],[this[fname||"calcPropVal"](starts[key],changes[key],step)]),memo);
		},{},this);
	};

	/**
	 *
	 */
	Algol.calcColl = function(starts,changes,step){ return this.calcObj(starts,changes,step,"calcObj");};

})(window);
