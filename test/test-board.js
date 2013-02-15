describe("the moveInDir",function(){
	it("is defined",function(){ expect(typeof Algol.moveInDir).toEqual("function"); });
	describe("when walking on a rectangle board",function(){
		describe("walking east",function(){
			var position = {x:3,y:4},
				dir = 3,
				forward = 4,
				right = 1,
				res = Algol.moveInDir(position,dir,forward,right);
			expect(res).toEqual({x:7,y:5});
		});
		describe("walking southwest",function(){
			var position = {x:5,y:4},
				dir = 6,
				forward = 2,
				right = -1,
				res = Algol.moveInDir(position,dir,forward,right);
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
		describe("it warns when outside",function(){
			[{x:0,y:1},{y:0,x:1},{x:666,y:1},{x:1,y:666}].forEach(function(outside){
				expect(Algol.isOnBoard(outside,board)).toEqual(false);
			});
		});
	});
});