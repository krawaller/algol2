describe("the moveInDir",function(){
	it("is defined",function(){ expect(typeof Algol.moveInDir).toEqual("function"); });
	describe("when walking on a rectangle board",function(){
		describe("walking east",function(){
			var position = {x:3,y:4},
				dir = 3,
				instruction = { forward: 4, right: 1 },
				res = Algol.moveInDir(position,dir,instruction);
			expect(res).toEqual({x:7,y:5});
		});
		describe("walking southwest",function(){
			var position = {x:5,y:4},
				dir = 6,
				instruction = { forward: 2, right: -1 },
				res = Algol.moveInDir(position,dir,instruction);
			expect(res).toEqual({x:4,y:7});
		});
	});
});

describe("the dirRelativeTo",function(){
	it("is defined",function(){ expect(typeof Algol.dirRelativeTo).toEqual("function"); });
	describe("when turning on a rectangle board",function(){
		describe("southeast relative to west",function(){
			expect(Algol.dirRelativeTo(4,7)).toEqual(2);
		});
	});
});

describe("the isOnBoard",function(){
	it("is defined",function(){ expect(typeof Algol.isOnBoard).toEqual("function"); });
	describe("when testing on a rectangle board",function(){
		var board = {x:5,y:5,shape:"rectangle"};
		it("warns when outside",function(){
			[{x:0,y:1},{y:0,x:1},{x:666,y:1},{x:1,y:666}].forEach(function(outside){
				expect(Algol.isOnBoard(outside,board)).toEqual(false);
			});
		});
		it("returns true when not outside",function(){
			[{x:1,y:5},{y:5,x:1},{x:1,y:1},{x:5,y:5},{x:3,y:3}].forEach(function(outside){
				expect(Algol.isOnBoard(outside,board)).toEqual(true);
			});
		});
	});
});

describe("the posToYkx function",function(){
	it("is defined",function(){ expect(typeof Algol.posToYkx).toEqual("function"); });
	it("returns correct val",function(){
		expect(Algol.posToYkx({x:4,y:3})).toEqual(3004);
	});
});

describe("the posToYkx function",function(){
	it("is defined",function(){ expect(typeof Algol.posToYkx).toEqual("function"); });
	it("returns correct val",function(){ expect(Algol.posToYkx({x:4,y:3})).toEqual(3004); });
});

describe("the ykxToPos function",function(){
	it("is defined",function(){ expect(typeof Algol.ykxToPos).toEqual("function"); });
	it("returns correct val",function(){ expect(Algol.ykxToPos(3004)).toEqual({x:4,y:3}); });
});

describe("the generateBoardSquares function",function(){
	it("is defined",function(){ expect(typeof Algol.generateBoardSquares).toEqual("function"); });
	it("returns correct objs",function(){
		var boarddef = {x:3,y:2,shape:"rectangle"},
			clrs = {1001:{colour:"white",x:1,y:1},1002:{colour:"black",x:2,y:1},1003:{colour:"white",x:3,y:1},
					2001:{colour:"black",x:1,y:2},2002:{colour:"white",x:2,y:2},2003:{colour:"black",x:3,y:2}};
		expect(Algol.generateBoardSquares(boarddef)).toEqual(clrs);
	});
});





