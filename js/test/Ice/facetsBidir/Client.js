// **********************************************************************
//
// Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************

(function(global){
    var require = typeof(module) !== "undefined" ? module.require : function(){};
    require("Ice/Ice");
    var Ice = global.Ice;

    require("Test");
    require("../facets/Client");
    var Test = global.Test;
    var Promise = Ice.Promise;

    require("TestI");
    var DI = global.DI;
    var FI = global.FI;
    var HI = global.HI;
    var EmptyI = global.EmptyI;

    var allTests = function(out, communicator)
    {
        var p = new Promise();
        var test = function(b)
        {
            if(!b)
            {
                try
                {
                    throw new Error("test failed");
                }
                catch(err)
                {
                    p.fail(err);
                    throw err;
                }
            }
        };
        Promise.try(
            function()
            {
                out.write("testing facet registration exceptions... ");
                return communicator.createObjectAdapter("");
            }
        ).then(
            function(adapter)
            {
                var obj = new EmptyI();
                adapter.add(obj, communicator.stringToIdentity("d"));
                adapter.addFacet(obj, communicator.stringToIdentity("d"), "facetABCD");
                try
                {
                    adapter.addFacet(obj, communicator.stringToIdentity("d"), "facetABCD");
                    test(false);
                }
                catch(ex)
                {
                    test(ex instanceof Ice.AlreadyRegisteredException);
                }
                adapter.removeFacet(communicator.stringToIdentity("d"), "facetABCD");
                try
                {
                    adapter.removeFacet(communicator.stringToIdentity("d"), "facetABCD");
                    test(false);
                }
                catch(ex)
                {
                    test(ex instanceof Ice.NotRegisteredException);
                }
                out.writeLine("ok");

                out.write("testing removeAllFacets... ");
                var obj1 = new EmptyI();
                var obj2 = new EmptyI();
                adapter.addFacet(obj1, communicator.stringToIdentity("id1"), "f1");
                adapter.addFacet(obj2, communicator.stringToIdentity("id1"), "f2");
                var obj3 = new EmptyI();
                adapter.addFacet(obj1, communicator.stringToIdentity("id2"), "f1");
                adapter.addFacet(obj2, communicator.stringToIdentity("id2"), "f2");
                adapter.addFacet(obj3, communicator.stringToIdentity("id2"), "");
                var fm = adapter.removeAllFacets(communicator.stringToIdentity("id1"));
                test(fm.size === 2);
                test(fm.get("f1") === obj1);
                test(fm.get("f2") === obj2);
                try
                {
                    adapter.removeAllFacets(communicator.stringToIdentity("id1"));
                    test(false);
                }
                catch(ex)
                {
                    test(ex instanceof Ice.NotRegisteredException);
                }
                fm = adapter.removeAllFacets(communicator.stringToIdentity("id2"));
                test(fm.size == 3);
                test(fm.get("f1") === obj1);
                test(fm.get("f2") === obj2);
                test(fm.get("") === obj3);
                out.writeLine("ok");

                return adapter.deactivate();
            }
        ).then(
            function(r)
            {
                return communicator.createObjectAdapter("");
            }
        ).then(
            function(adapter)
            {
                var di = new DI();
                adapter.add(di, communicator.stringToIdentity("d"));
                adapter.addFacet(di, communicator.stringToIdentity("d"), "facetABCD");
                var fi = new FI();
                adapter.addFacet(fi, communicator.stringToIdentity("d"), "facetEF");
                var hi = new HI();
                adapter.addFacet(hi, communicator.stringToIdentity("d"), "facetGH");
                
                var prx = Ice.ObjectPrx.uncheckedCast(communicator.stringToProxy("d:default -p 12010"));
                return prx.ice_getConnection().then(
                    function(conn)
                    {
                        conn.setAdapter(adapter);
                        return __clientAllTests__(out, communicator);
                    });
            }
        ).then(
            function()
            {
                p.succeed();
            },
            function(ex)
            {
                p.fail(ex);
            });
        
        return p;
    };

    var run = function(out, id)
    {
        return Promise.try(
            function()
            {
                var communicator = Ice.initialize(id);
                out.writeLine("testing bidir callbacks with synchronous dispatch...");
                return allTests(out, communicator).then(
                    function()
                    {
                        return communicator.destroy();
                    }
                ).then(
                    function()
                    {
                        communicator = Ice.initialize(id);
                        return global.Test.EchoPrx.checkedCast(
                            communicator.stringToProxy("__echo:default -p 12010"));
                    }
                ).then(
                    function(prx)
                    {
                        return prx.shutdown();
                    }
                ).then(
                    function()
                    {
                        return communicator.destroy();
                    });
            });
    };
    global.__test__ = run;
    global.__runEchoServer__ = true;
}(typeof (global) === "undefined" ? window : global));
