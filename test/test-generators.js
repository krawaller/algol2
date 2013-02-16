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
				isOnBoard: sinon.spy(function(pos,board){return pos === dir1+"walked";}),
				posToYkx: sinon.spy(function(pos){return pos+"ykx";})
			},
			def = _.uniqueId(),
			res = Algol.offsetInDirs.call(context,def,startpos,dirs,board);
		it("used moveInDir on all dirs",function(){
			expect(context.moveInDir).toHaveBeenCalledTwice();
			expect(context.moveInDir.firstCall.args).toEqual([startpos,dir1,def,board]);
			expect(context.moveInDir.secondCall.args).toEqual([startpos,dir2,def,board]);
		});
		it("used isOnBoard to check results",function(){
			expect(context.isOnBoard).toHaveBeenCalledTwice();
			expect(context.isOnBoard.firstCall.args).toEqual([dir1+"walked",board]);
			expect(context.isOnBoard.secondCall.args).toEqual([dir2+"walked",board]);
		});
		it("used posToYkx on the onboard pos",function(){
			expect(context.posToYkx).toHaveBeenCalledOnce();
			expect(context.posToYkx.firstCall.args).toEqual([dir1+"walked"]);
		});
		it("returns correct object",function(){
			expect(res).toEqual(_.object([dir1+"walkedykx"],[{dir:dir1}]));
		});
	});
	it("passes integration test",function(){
		var dirs = [1,3],
			def = { forward: 2, right: 1 },
			startpos = { x:1,y:1 },
			board = {x:5,y:5},
			res = Algol.offsetInDirs(def,startpos,dirs,board);
		expect(res).toEqual({2003:{dir:3}});
	});
});

describe("the walkcheck function",function(){
	it("is defined",function(){ expect(typeof Algol.walkCheck).toEqual("function"); });
	describe("when walked too far",function(){
		var context = { isOnBoard: sinon.spy(), posToYkx: sinon.spy() },
			res = Algol.walkCheck.call(context,undefined,3,2);
		it("returns exceededmax",function(){
			expect(res).toEqual("exceededmax");
		});
		it("didn't need to use any other function",function(){
			expect(context.isOnBoard).not.toHaveBeenCalled();
			expect(context.posToYkx).not.toHaveBeenCalled();
		});
	});
	describe("when out of bounds",function(){
		var context = { isOnBoard: sinon.stub().returns(true), posToYkx: sinon.spy() },
			pos = _.uniqueId(),
			board = _.uniqueId(),
			res = Algol.walkCheck.call(context,pos,0,0,undefined,undefined,board);
		it("returns outofbounds",function(){
			expect(res).toEqual("outofbounds");
		});
		it("didn't need to use posToYkx",function(){
			expect(context.posToYkx).not.toHaveBeenCalled();
		});
		it("used isOnBoard",function(){
			expect(context.isOnBoard).toHaveBeenCalledOnce();
			expect(context.isOnBoard.firstCall.args).toEqual([pos,board]);
		});

	});
});