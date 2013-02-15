describe("the position function",function(){
	it("is defined",function(){
		expect(typeof Algol.getWorldPosition).toEqual("function");
	});
	it("returns ok object",function(){
		var world = {
			foo: {
				2003: {prop:"good"},
				1006: {otherprop:"someval"}
			},
			bar: {
				2003: {myprop:"good",importantmsg:"buymilk"},
				3456: {myotherprop:"someval"}
			},
			baz: {
				4321: {someblah:"roo"}
			}
		};
		var res = Algol.getWorldPosition(world,2003);
		//expect({a:1}).toEqual({a:1});
		expect(res).toEqual({TYPE:"POSITION",foo:{prop:"good"},bar:{myprop:"good",importantmsg:"buymilk"},baz:{}});
	});
});

describe("the matchProp function",function(){
	it("is defined",function(){expect(typeof Algol.matchProp).toEqual("function");});
	it("returns false when incorrect",function(){
		var res = Algol.matchProp("foo","bar",{});
		expect(res).toEqual(false);
	});
	it("returns true when correct",function(){
		var res = Algol.matchProp("foo","foo",{});
		expect(res).toEqual(true);
	});
	it("returns true when equals environment var",function(){
		var res = Algol.matchProp("PLAYER",1,{PLAYER:1});
		expect(res).toEqual(true);
	});
});

describe("the matchAll function",function(){
	it("is defined",function(){expect(typeof Algol.matchAll).toEqual("function");});
	it("returns true when matching against empty obj",function(){
		var res = Algol.matchAll({foo:"bar"},{},{});
		expect(res).toEqual(true);
	});
	it("uses matchProp and fails if that returns false",function(){
		var context = {matchProp: sinon.stub().returns(false)},
			environment = "ENV",
			object = {foo:{bar:"bin"}},
			objecttomatch = {foo:{bar:"bar"}},
			res = Algol.matchAll.call(context,object,objecttomatch,environment);
		expect(res).toEqual(false);
		expect(context.matchProp).toHaveBeenCalledWith("bin","bar",environment);
	});
	it("uses matchProp and passes if that returns true",function(){
		var context = {matchProp: sinon.stub().returns(true)},
			environment = "ENV",
			object = {foo:{bar:"bin5"}},
			objecttomatch = {foo:{bar:"bar2000",BAR:"BOO2000"}},
			res = Algol.matchAll.call(context,object,objecttomatch,environment);
		expect(res).toEqual(true);
		expect(context.matchProp).toHaveBeenCalledTwice();
		expect(context.matchProp.firstCall.args).toEqual(["bin5","bar2000",environment]);
		expect(context.matchProp.secondCall.args).toEqual([undefined,"BOO2000",environment]);
	});
	it("passes integrity test too",function(){
		var environment = "ENV",
			object = {foo:{bar:"bin",BAR:"BOO",yada:"whatever"}},
			objecttomatch = {foo:{bar:"bin",BAR:"BOO"}},
			res = Algol.matchAll(object,objecttomatch,environment);
		expect(res).toEqual(true);
	});
});


describe("the matchAny function",function(){
	it("is defined",function(){expect(typeof Algol.matchAny).toEqual("function");});
	it("returns false when matching against empty obj",function(){
		var res = Algol.matchAny({foo:"bar"},{},{});
		expect(res).toEqual(false);
	});
	it("uses matchProp and fails if that returns false",function(){
		var context = {matchProp: sinon.stub().returns(false)},
			environment = "ENV",
			object = {foo:{bar:"bin"}},
			objecttomatch = {foo:{bar:"bar"}},
			res = Algol.matchAny.call(context,object,objecttomatch,environment);
		expect(res).toEqual(false);
		expect(context.matchProp).toHaveBeenCalledWith("bin","bar",environment);
	});
	it("uses matchProp and passes if that returns true",function(){
		var context = {matchProp: sinon.stub().returns(true)},
			environment = "ENV",
			object = {foo:{bar:"bin"}},
			objecttomatch = {foo:{bar:"bar",BAR:"BOO"}},
			res = Algol.matchAny.call(context,object,objecttomatch,environment);
		expect(res).toEqual(true);
		expect(context.matchProp).toHaveBeenCalledOnce();
		expect(context.matchProp.firstCall.args).toEqual(["bin","bar",environment]);
	});
	it("passes integrity test too",function(){
		var environment = "ENV",
			object = {foo:{bar:"bin",BAR:"notboo",yada:"whatever"}},
			objecttomatch = {foo:{bar:"bin",BAR:"BOO"}},
			res = Algol.matchAny(object,objecttomatch,environment);
		expect(res).toEqual(true);
	});
});



