describe("the offsetindirs function",function(){
	it("is defined",function(){ expect(typeof Algol.offsetInDirs).toEqual("function"); });
	describe("when called",function(){
		var dir1 = _.uniqueId(),
			dir2 = _.uniqueId(),
			dirs = [dir1,dir2],
			startpos = _.uniqueId(),
			newpos = _.uniqueId(),
			ykx = _.uniqueId(),
			board = _.uniqueId(),
			context = {
				moveInDir: sinon.spy(function(move,dir){return dir+"walked";}),
				outOfBounds: sinon.spy(function(pos,board){return pos === dir1+"walked";}),
				posToYkx: sinon.spy(function(pos){return pos+"ykx";})
			},
			def = _.uniqueId(),
			res = Algol.offsetInDirs.call(context,def,startpos,dirs,board);
		it("used moveInDir on all dirs",function(){
			expect(context.moveInDir).toHaveBeenCalledTwice();
			expect(context.moveInDir.firstCall.args).toEqual([startpos,dir1,def,board]);
			expect(context.moveInDir.secondCall.args).toEqual([startpos,dir2,def,board]);
		});
		it("used outOfBounds to check results",function(){
			expect(context.outOfBounds).toHaveBeenCalledTwice();
			expect(context.outOfBounds.firstCall.args).toEqual([dir1+"walked",board]);
			expect(context.outOfBounds.secondCall.args).toEqual([dir2+"walked",board]);
		});
		it("used posToYkx on the onboard pos",function(){
			expect(context.posToYkx).toHaveBeenCalledOnce();
			expect(context.posToYkx.firstCall.args).toEqual([dir1+"walked"]);
		});
		it("returns correct object",function(){
			expect(res).toEqual(_.object([dir1+"walkedykx"],[{DIR:dir1}]));
		});
	});
	it("passes integration test",function(){
		var dirs = [1,3],
			def = { forward: 2, right: 1 },
			startpos = { x:1,y:1 },
			board = {x:5,y:5},
			res = Algol.offsetInDirs(def,startpos,dirs,board);
		expect(res).toEqual({2003:{DIR:3}});
	});
});

describe("the walkcheck function",function(){
	it("is defined",function(){ expect(typeof Algol.walkCheck).toEqual("function"); });
	describe("when all is in order",function(){
		var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
			steps = {someykx:"bar"},
			stops = {baz:"bin"},
			res = Algol.walkCheck.call(context,undefined,2,3,stops,steps);
		it("returns undefined",function(){
			expect(res).toBeUndefined();
		});
	});
	describe("when step is missing",function(){
		var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
			steps = {foo:"bar"},
			stops = {baz:"bin"},
			res = Algol.walkCheck.call(context,undefined,2,3,stops,steps);
		it("returns nostep",function(){
			expect(res).toEqual("nostep");
		});
	});
	describe("when hit stop",function(){
		var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
			stops = {someykx:"bin"},
			res = Algol.walkCheck.call(context,undefined,2,3,stops);
		it("returns hitstop",function(){
			expect(res).toEqual("hitstop");
		});
	});
	describe("when step is missing AND hit stop",function(){
		var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
			stops = {someykx:"bin"},
			steps = {foo:"bar"}
			res = Algol.walkCheck.call(context,undefined,2,3,stops,steps);
		it("returns hitstop as that takes precedence",function(){
			expect(res).toEqual("hitstop");
		});
	});
	describe("when walked too far",function(){
		var context = { outOfBounds: sinon.spy(), posToYkx: sinon.spy() },
			res = Algol.walkCheck.call(context,undefined,3,2);
		it("returns exceededmax",function(){
			expect(res).toEqual("exceededmax");
		});
		it("didn't need to use any other function",function(){
			expect(context.outOfBounds).not.toHaveBeenCalled();
			expect(context.posToYkx).not.toHaveBeenCalled();
		});
	});
	describe("when hit stop AND walked too far",function(){
		var context = {outOfBounds: sinon.stub().returns(false), posToYkx: sinon.stub().returns("someykx") },
			stops = {someykx:"bin"},
			res = Algol.walkCheck.call(context,undefined,3,2,stops);
		it("returns exceededmax as that takes precedence",function(){
			expect(res).toEqual("exceededmax");
		});
	});
	describe("when out of bounds",function(){
		var context = { outOfBounds: sinon.stub().returns(true), posToYkx: sinon.spy() },
			pos = _.uniqueId(),
			board = _.uniqueId(),
			res = Algol.walkCheck.call(context,pos,0,0,undefined,undefined,board);
		it("returns outofbounds",function(){
			expect(res).toEqual("outofbounds");
		});
		it("didn't need to use posToYkx",function(){
			expect(context.posToYkx).not.toHaveBeenCalled();
		});
		it("used outOfBounds",function(){
			expect(context.outOfBounds).toHaveBeenCalledOnce();
			expect(context.outOfBounds.firstCall.args).toEqual([pos,board]);
		});
	});
	describe("when out of bounds AND exceeded max",function(){
		var context = {outOfBounds: sinon.stub().returns(true), posToYkx: sinon.stub().returns("someykx") },
			res = Algol.walkCheck.call(context,undefined,3,2);
		it("returns exceededmax as that takes precedence",function(){
			expect(res).toEqual("exceededmax");
		});
	});
});

describe("the walkInDir function",function(){
	it("is defined",function(){ expect(typeof Algol.walkInDir).toEqual("function"); });
	describe("when walking and drawing all",function(){
		var dist = 0,
			startpos = {p:"P"},
			dir = _.uniqueId(),
			stopreason = _.uniqueId(),
			stops = _.uniqueId(),
			steps = _.uniqueId(),
			board = _.uniqueId(),
			context = {
				walkCheck: sinon.spy(function(){if (dist++ === 3) return stopreason;}),
				moveInDir: sinon.spy(function(p){return {p:p.p+"x"};}),
				posToYkx: sinon.spy(function(p){return "Y"+p.p;})
			},
			def = {
				drawatstep: true,
				drawatstop: true,
				max: _.uniqueId()
			},
			res = Algol.walkInDir.call(context,def,startpos,dir,stops,steps,board),
			keys = _.keys(res);
		it("returns an object for all steps and for the stop",function(){
			expect(keys.length).toEqual(4);
			_.each(["walkstep","walkstep","walkstep","walkstop"],function(kind,i){
				expect(res[keys[i]].WALKKIND).toEqual(kind);
			});
		});
		it("marks all objects with dir, distance, length and stopreason",function(){
			_.each(_.range(0,4),function(i){
				expect(res[keys[i]].WALKDISTANCE).toEqual(i+1);
				expect(res[keys[i]].WALKLENGTH).toEqual(4);
				expect(res[keys[i]].WALKSTOPREASON).toEqual(stopreason);
				expect(res[keys[i]].DIR).toEqual(dir);
			});
		});
		it("uses walkCheck for each step",function(){
			expect(context.walkCheck.callCount).toEqual(4);
			expect(context.walkCheck.firstCall.args).toEqual([{p:"Px"},1,def.max,stops,steps,board]);
			expect(context.walkCheck.secondCall.args).toEqual([{p:"Pxx"},2,def.max,stops,steps,board]);
			expect(context.walkCheck.thirdCall.args).toEqual([{p:"Pxxx"},3,def.max,stops,steps,board]);
			expect(context.walkCheck.lastCall.args).toEqual([{p:"Pxxxx"},4,def.max,stops,steps,board]);
		});
		it("used movedInDir for each step",function(){
			expect(context.moveInDir.callCount).toEqual(4);
			expect(context.moveInDir.firstCall.args).toEqual([{p:"P"},dir,{forward:1},board]);
			expect(context.moveInDir.secondCall.args).toEqual([{p:"Px"},dir,{forward:1},board]);
			expect(context.moveInDir.thirdCall.args).toEqual([{p:"Pxx"},dir,{forward:1},board]);
			expect(context.moveInDir.lastCall.args).toEqual([{p:"Pxxx"},dir,{forward:1},board]);
		});
		it("used posToYkx to determine keys",function(){
			expect(context.posToYkx.callCount).toEqual(4);
			expect(context.posToYkx.firstCall.args[0].p).toEqual("Px");
			expect(context.posToYkx.lastCall.args[0].p).toEqual("Pxxxx");
		});
	});
	describe("when walking and drawing all but stopping due to outofbounds",function(){
		var dist = 0,
			startpos = {p:"P"},
			dir = _.uniqueId(),
			stopreason = "outofbounds",
			stops = _.uniqueId(),
			steps = _.uniqueId(),
			board = _.uniqueId(),
			context = {
				walkCheck: sinon.spy(function(){if (dist++ === 3) return stopreason;}),
				moveInDir: sinon.spy(function(p){return {p:p.p+"x"};}),
				posToYkx: sinon.spy(function(p){ return "Y"+p.p;})},
			def = {
				drawatstep: true,
				drawatstop: true,
				max: _.uniqueId()
			},
			res = Algol.walkInDir.call(context,def,startpos,dir,stops,steps,board),
			keys = _.keys(res);
		it("doesn't include the stop square",function(){
			expect(keys.length).toEqual(3);
			_.each(keys,function(key){
				expect(res[key].WALKKIND).toEqual("walkstep");
			});
		});
	});
	describe("when only drawing stop",function(){
		var dist = 0,
			startpos = {p:"P"},
			dir = _.uniqueId(),
			stopreason = _.uniqueId(),
			stops = _.uniqueId(),
			steps = _.uniqueId(),
			board = _.uniqueId(),
			context = {
				walkCheck: sinon.spy(function(){if (dist++ === 3) return stopreason;}),
				moveInDir: sinon.spy(function(p){return {p:p.p+"x"};}),
				posToYkx: sinon.spy(function(p){ return "Y"+p.p;})},
			def = {
				drawatstep: false,
				drawatstop: true,
				max: _.uniqueId()
			},
			res = Algol.walkInDir.call(context,def,startpos,dir,stops,steps,board),
			keys = _.keys(res);
		it("doesn't include step squares",function(){
			expect(keys.length).toEqual(1);
			expect(res[keys[0]].WALKKIND).toEqual("walkstop");
		});
	});
	describe("when only drawing steps",function(){
		var dist = 0,
			startpos = {p:"P"},
			dir = _.uniqueId(),
			stopreason = _.uniqueId(),
			stops = _.uniqueId(),
			steps = _.uniqueId(),
			board = _.uniqueId(),
			context = {
				walkCheck: sinon.spy(function(){if (dist++ === 3) return stopreason;}),
				moveInDir: sinon.spy(function(p){return {p:p.p+"x"};}),
				posToYkx: sinon.spy(function(p){ return "Y"+p.p;})},
			def = {
				drawatstep: true,
				drawatstop: false,
				max: _.uniqueId()
			},
			res = Algol.walkInDir.call(context,def,startpos,dir,stops,steps,board),
			keys = _.keys(res);
		it("doesn't include the stop square",function(){
			expect(keys.length).toEqual(3);
			_.each(keys,function(key){
				expect(res[key].WALKKIND).toEqual("walkstep");
			});
		});
	});
});

describe("the walkInDirs function",function(){
	it("is defined",function(){ expect(typeof Algol.walkInDir).toEqual("function"); });
	describe("when used",function(){
		var context = { walkInDir: sinon.spy(function(foo,bar,dir){
				return _.object(["x"+dir,"y"+dir],[dir,dir]);
			})},
			dirs = [1,2,3],
			def = _.uniqueId(),
			startpos = _.uniqueId(),
			stops = _.uniqueId(),
			steps = _.uniqueId(),
			board = _.uniqueId(),
			res = Algol.walkInDirs.call(context,def,startpos,dirs,stops,steps,board);
		it("returns correct object",function(){
			expect(res).toEqual({
				x1: 1, x2: 2, x3: 3, y1: 1, y2: 2, y3: 3
			});
		});
		it("used walkInDir correctly",function(){
			expect(context.walkInDir.callCount).toEqual(3);
			expect(context.walkInDir.firstCall.args).toEqual([def,startpos,1,stops,steps,board]);
			expect(context.walkInDir.secondCall.args).toEqual([def,startpos,2,stops,steps,board]);
			expect(context.walkInDir.thirdCall.args).toEqual([def,startpos,3,stops,steps,board]);
		});
	});
});





