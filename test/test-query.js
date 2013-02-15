describe("the position function",function(){
	it("is defined",function(){ expect(typeof Algol.getWorldPosition).toEqual("function"); });
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

describe("the resolve function",function(){
	it("is defined",function(){expect(typeof Algol.resolve).toEqual("function");});
	it("calls the named test func",function(){
		var stubreturnval = "FOOBAR",
			context = {someTestFunc: sinon.stub().returns(stubreturnval)},
			objtotest = {foo:"bar"},
			objtomatch = {baz:"bin"},
			condition = {test:"someTestFunc",against:objtomatch},
			environment = "ENV",
			res = Algol.resolve.call(context,objtotest,condition,environment);
		expect(res).toEqual(stubreturnval);
		expect(context.someTestFunc).toHaveBeenCalledOnce();
		expect(context.someTestFunc.firstCall.args).toEqual([objtotest,objtomatch,environment]);
	});
});

describe("the ifElse function",function(){
	it("is defined",function(){expect(typeof Algol.ifElse).toEqual("function");});
	it("returns objects directly if they haven't got TYPE=IFELSE",function(){
		var objtotest = {baz:"bin"},
			nonIfElse = {foo:"bar"},
			environment = "ENV";
		expect(Algol.ifElse(objtotest,nonIfElse,environment)).toEqual(nonIfElse);
	});
	it("resolves the if and returns the ifelse-tested then if the iftest was true",function(){
		var objtotest = {baz:"bin"},
			ifelsereturnval = "FOOOO",
			context = {
				resolve: sinon.stub().returns(true),
				ifElse: sinon.stub().returns(ifelsereturnval)
			},
			test = "SOMETEST",
			then = "THENPROP",
			ifelse = {TYPE:"IFELSE",iftest:test,then:then},
			environment = "ENV",
			res = Algol.ifElse.call(context,objtotest,ifelse,environment);
		expect(res).toEqual(ifelsereturnval);
		expect(context.resolve).toHaveBeenCalledOnce();
		expect(context.resolve.firstCall.args).toEqual([objtotest,ifelse.iftest,environment]);
		expect(context.ifElse).toHaveBeenCalledOnce();
		expect(context.ifElse.firstCall.args).toEqual([objtotest,then,environment]);
	});
	it("resolves the if and returns the ifelse-tested otherwise if the iftest was false",function(){
		var objtotest = {baz:"bin"},
			ifelsereturnval = "FOOOO",
			context = {
				resolve: sinon.stub().returns(false),
				ifElse: sinon.stub().returns(ifelsereturnval)
			},
			test = "SOMETEST",
			otherwise = "THENPROP",
			ifelse = {TYPE:"IFELSE",iftest:test,otherwise:otherwise},
			environment = "ENV",
			res = Algol.ifElse.call(context,objtotest,ifelse,environment);
		expect(res).toEqual(ifelsereturnval);
		expect(context.resolve).toHaveBeenCalledOnce();
		expect(context.resolve.firstCall.args).toEqual([objtotest,ifelse.iftest,environment]);
		expect(context.ifElse).toHaveBeenCalledOnce();
		expect(context.ifElse.firstCall.args).toEqual([objtotest,otherwise,environment]);
	});
	it("passes nested integration test",function(){
		var objtotest = {units: {player:"PLR"}},
			returnval = "WUUUU",
			ifelse = {
				TYPE: "IFELSE",
				iftest: {
					test: "matchAll",
					against: {units:{player:666,armour:42},board:{color:"black"}}
				},
				then: "NOTWANTED",
				otherwise: {
					TYPE: "IFELSE",
					iftest: {
						test: "matchAny",
						against: {units:{player:666,armour:42},board:{color:"black"}}
					},
					then: returnval,
					otherwise: "NOTWANTED"
				}
			},
			environment = {PLR:666},
			res = Algol.ifElse(objtotest,ifelse,environment);
		expect(res).toEqual(returnval);
	});
});

