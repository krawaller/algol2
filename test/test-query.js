describe("the getWorldPlaceByYkx function",function(){
	it("is defined",function(){ expect(typeof Algol.getWorldPlaceByYkx).toEqual("function"); });
	describe("when called",function(){
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
			}, pos = {x:_.uniqueId()},
			context = { ykxToPos: sinon.stub().returns(pos) },
			res = Algol.getWorldPlaceByYkx.call(context,world,2003);
		it("returns correct object",function(){
			expect(res).toEqual({
				TYPE:"PLACE",
				x: pos.x,
				foo:{prop:"good"},
				bar:{myprop:"good",importantmsg:"buymilk"},
				baz:{}
			});
		});
		it("used ykxToPos",function(){
			expect(context.ykxToPos).toHaveBeenCalledOnce();
			expect(context.ykxToPos.firstCall.args).toEqual([2003]);
		});
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
	it("returns false when proptomatch is missing",function(){
		expect(Algol.matchProp("foo")).toEqual(false);
	});
	describe("environment tests",function(){
		var returnval = _.uniqueId(),
			context = { matchProp: sinon.stub().returns(returnval) },
			proptomatch = {
				TYPE:"ENV",value:_.uniqueId()
			},
			environment = {foo:_.uniqueId()},
			prop = "foo",
			res = Algol.matchProp.call(context,prop,proptomatch,environment);
		it("should return value from envtest value",function(){
			expect(context.matchProp).toHaveBeenCalledOnce();
			expect(context.matchProp.firstCall.args).toEqual([prop,environment.value,environment]);
			expect(res).toEqual(returnval);
		});
	});
	describe("when given NOT test",function(){
		it("returns true if test fails, calling itself to find out",function(){
			var context = { matchProp: sinon.stub().returns(false) },
				environment = "ENV",
				prop = "PROP",
				proptonotmatch = "SOMEVAL",
				test = {TYPE:"NOT",value:proptonotmatch},
				res = Algol.matchProp.call(context,prop,test,environment);
			expect(res).toEqual(true);
			expect(context.matchProp).toHaveBeenCalledOnce();
			expect(context.matchProp.firstCall.args).toEqual([prop,proptonotmatch,environment]);
		});
		it("returns false if test passes",function(){
			var context = { matchProp: sinon.stub().returns(true) },
				environment = "ENV",
				prop = "PROP",
				proptonotmatch = "SOMEVAL",
				test = {TYPE:"NOT",value:proptonotmatch},
				res = Algol.matchProp.call(context,prop,test,environment);
			expect(res).toEqual(false);

		});
	});
	describe("when given OR test",function(){
		describe("with no matching values",function(){
			var context = { matchProp: sinon.stub().returns(false) },
				environment = _.uniqueId(),
				prop = _.uniqueId(),
				vals = [_.uniqueId(),_.uniqueId(),_.uniqueId()],
				test = {TYPE:"OR",values:vals},
				res = Algol.matchProp.call(context,prop,test,environment);
			it("returns false",function(){
				expect(res).toEqual(false);
			});
			it("called itself on all three vals",function(){
				expect(context.matchProp).toHaveBeenCalledThrice();
				expect(context.matchProp.firstCall.args).toEqual([prop,vals[0],environment]);
				expect(context.matchProp.secondCall.args).toEqual([prop,vals[1],environment]);
				expect(context.matchProp.thirdCall.args).toEqual([prop,vals[2],environment]);
			});
		});
		describe("with a matching val",function(){
			var tried = 0,
				context = { matchProp: sinon.spy(function(){return ++tried===2;}) },
				environment = _.uniqueId(),
				prop = _.uniqueId(),
				vals = [_.uniqueId(),_.uniqueId(),_.uniqueId()],
				test = {TYPE:"OR",values:vals},
				res = Algol.matchProp.call(context,prop,test,environment);
			it("returns true",function(){
				expect(res).toEqual(true);
			});
			it("called itself on vals until it found match",function(){
				expect(context.matchProp).toHaveBeenCalledTwice();
				expect(context.matchProp.firstCall.args).toEqual([prop,vals[0],environment]);
				expect(context.matchProp.secondCall.args).toEqual([prop,vals[1],environment]);
			});
		});
	});
});

describe("the matchAll function",function(){
	it("is defined",function(){expect(typeof Algol.matchAll).toEqual("function");});
	it("returns true when matching against empty obj",function(){
		var res = Algol.matchAll({foo:"bar"},{},{});
		expect(res).toEqual(true);
	});
	it("uses matchAllPropsInAspect and returns that result",function(){
		var context = {matchAllPropsInAspect: sinon.stub().returns(true)},
			environment = "ENV",
			object = {foo:{bar:"bin"}},
			objecttomatch = {foo:{bar:"bar"}},
			res = Algol.matchAll.call(context,object,objecttomatch,environment);
		expect(res).toEqual(true);
		expect(context.matchAllPropsInAspect).toHaveBeenCalledWith(object.foo,objecttomatch.foo,environment);
	});
	it("passes integration test too",function(){
		var environment = "ENV",
			object = {foo:{bar:"bin",BAR:"BOO",yada:"whatever"}},
			objecttomatch = {foo:{bar:"bin",BAR:"BOO"}},
			res = Algol.matchAll(object,objecttomatch,environment);
		expect(res).toEqual(true);
	});
	/*describe("when aspects are arrays",function(){
		it("handles passing test",function(){
			var environment = "ENV",
				object = {foo:[{bar:"bin1"},{bar:"bin2"}],woo:{wee:"wuu"}},
				objecttomatch = {foo:{bar:"bin2"},woo:{wee:"wuu"}},
				res = Algol.matchAll(object,objecttomatch,environment);
			expect(res).toEqual(true);
		});
		it("handles failing test",function(){
			var environment = "ENV",
				object = {foo:[{bar:"bin1"},{bar:"bin2"}],woo:{wee:"wuu"}},
				objecttomatch = {foo:{bar:"bin3"},woo:{wee:"wuu"}},
				res = Algol.matchAll(object,objecttomatch,environment);
			expect(res).toEqual(false);
		});
	});*/
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
		var objtotest = {units: {player:666}},
			returnval = "WUUUU",
			ifelse = {
				TYPE: "IFELSE",
				iftest: {
					test: "matchAll",
					against: {units:{player:{TYPE:"ENV",value:"PLR"},armour:42},board:{color:"black"}}
				},
				then: "NOTWANTED",
				otherwise: {
					TYPE: "IFELSE",
					iftest: {
						test: "matchAny",
						against: {units:{player:{TYPE:"ENV",value:"PLR"},armour:42},board:{color:"black"}}
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

describe("the findMatchingPlaceAddresses function",function(){
	it("is defined",function(){ expect(typeof Algol.findMatchingPlaceAddresses).toEqual("function"); });
	it("works as expected",function(){
		var world = "world",
			placetomatch = "placetomatch",
			environment = _.uniqueId(),
			addresses = [2,3],
			worldplace = "worldplace",
			context = {
				getWorldPlaceByYkx: sinon.stub().returns(worldplace),
				matchAll: sinon.stub().returns(false)
			},
			ret = Algol.findMatchingPlaceAddresses.call(context,world,placetomatch,environment,addresses);
		expect(ret).toEqual([]);
		expect(context.getWorldPlaceByYkx).toHaveBeenCalledTwice();
		expect(context.getWorldPlaceByYkx.firstCall.args).toEqual([world,2]);
		expect(context.getWorldPlaceByYkx.secondCall.args).toEqual([world,3]);
		expect(context.matchAll).toHaveBeenCalledTwice();
		expect(context.matchAll.firstCall.args).toEqual([worldplace,placetomatch,environment]);
	});
	it("returns correct addresses in an integration test",function(){
		var world = {
				foo:{1:{prop:1},2:{prop:1},3:{prop:1}},
				bar:{1:{some:"what"},2:{some:"what"}}
			},
			placetomatch = {foo:{prop:1},bar:{some:"what"}},
			environment = _.uniqueId(),
			addresses = [2,3];
		expect(Algol.findMatchingPlaceAddresses(world,placetomatch,environment,addresses)).toEqual([2]);
	});
});

