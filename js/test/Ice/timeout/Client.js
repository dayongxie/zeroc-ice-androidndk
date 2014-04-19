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
    var Test = global.Test;
    var Promise = Ice.Promise;
    
    var allTests = function(out, communicator)
    {
        var failCB = function() { test(false); };
        var ref, obj, mult, timeout, to, connection, comm, now;
        
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
                ref = "timeout:default -p 12010";
                obj = communicator.stringToProxy(ref);
                test(obj !== null);

                mult = 1;
                if(communicator.getProperties().getPropertyWithDefault("Ice.Default.Protocol", "tcp") === "ssl")
                {
                    mult = 4;
                }

                return Test.TimeoutPrx.checkedCast(obj);
            }
        ).then(
            function(obj)
            {
                timeout = obj;
                test(timeout !== null);
                out.write("testing connect timeout... ");
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(500 * mult));
                return to.holdAdapter(2000 * mult);
            }
        ).then(
            function()
            {
                return to.ice_getConnection();
            }
        ).then(
            function(con)
            {
                return con.close(true); // Force a reconnect.
            }
        ).then(
            function()
            {
                //
                // Expect ConnectTimeoutException.
                //
                return to.op();
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.ConnectTimeoutException);
                return timeout.op(); // Ensure adapter is active.
            }
        ).then(
            function()
            {
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(2000 * mult));
                return to.holdAdapter(500 * mult);
            }
        ).then(
            function()
            {
                return to.ice_getConnection();
            }
        ).then(
            function(con)
            {
                return con.close(true); // Force a reconnect.
            }
        ).then(
            function()
            {
                //
                // Expect success.
                //
                return to.op();
            }
        ).then(
            function()
            {
                out.writeLine("ok");
                out.write("testing read timeout... ");
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(500 * mult));
                //
                // Expect TimeoutException.
                //
                return to.sleep(750 * mult);
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.TimeoutException);
                return timeout.op(); // Ensure adapter is active.
            }
        ).then(
            function()
            {
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(1500 * mult));
                return to.sleep(500 * mult);
            }
        ).then(
            function()
            {
                out.writeLine("ok");
                out.write("testing write timeout... ");
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(500 * mult));
                return to.holdAdapter(2000 * mult);
            }
        ).then(
            function()
            {
                var seq = Ice.Buffer.createNative(new Array(100000));
                for(var i = 0; i < seq.length; ++i)
                {
                    seq[i] = 0;
                }
                //
                // Expect TimeoutException.
                //
                return to.sendData(seq);
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.TimeoutException);
                return timeout.op(); // Ensure adapter is active.
            }
        ).then(
            function()
            {
                // NOTE: 30s timeout is necessary for Firefox/IE on Windows
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(30000 * mult));
                return to.holdAdapter(500 * mult);
            }
        ).then(
            function()
            {
                var seq;
                if(mult === 1)
                {
                    seq = Ice.Buffer.createNative(new Array(512 * 1024));
                }
                else
                {
                    seq = Ice.Buffer.createNative(new Array(5 * 1024));
                }
                for(var i = 0; i < seq.length; ++i)
                {
                    seq[i] = 0;
                }
                //
                // Expect success.
                //
                return to.sendData(seq);
            }
        ).then(
            function()
            {
                out.writeLine("ok");
                out.write("testing close timeout... ");
                to = Test.TimeoutPrx.uncheckedCast(obj.ice_timeout(250));
                return to.ice_getConnection();
            }
        ).then(
            function(con)
            {
                connection = con;
                return timeout.holdAdapter(750);
            }
        ).then(
            function()
            {
                return connection.close(false);
            }
        ).then(
            function()
            {
                try
                {
                    connection.getInfo(); // getInfo() doesn't throw in the closing state
                }
                catch(ex)
                {
                    test(false);
                }
            }
        ).delay(500).then(
            function()
            {
                try
                {
                    connection.getInfo();
                    test(false);
                }
                catch(ex)
                {
                    test(ex instanceof Ice.CloseConnectionException); // Expected
                }
                return timeout.op();
            }
        ).then(
            function()
            {
                out.writeLine("ok");
                out.write("testing timeout overrides... ");
                //
                // Test Ice.Override.Timeout. This property overrides all
                // endpoint timeouts.
                //
                var initData = new Ice.InitializationData();
                initData.properties = communicator.getProperties().clone();
                if(mult === 1)
                {
                    initData.properties.setProperty("Ice.Override.Timeout", "500");
                }
                else
                {
                    initData.properties.setProperty("Ice.Override.Timeout", "2000");
                }
                comm = Ice.initialize(initData);
                return Test.TimeoutPrx.checkedCast(comm.stringToProxy(ref));
            }
        ).then(
            function(obj)
            {
                to = obj;
                return to.sleep(750 * mult);
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.TimeoutException);
                return timeout.op(); // Ensure adapter is active.
            }
        ).then(
            function()
            {
                //
                // Calling ice_timeout() should have no effect.
                //
                return Test.TimeoutPrx.checkedCast(to.ice_timeout(1000 * mult));
            }
        ).then(
            function(obj)
            {
                to = obj;
                return to.sleep(750 * mult);
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.TimeoutException);
                return comm.destroy();
            }
        ).then(
            function()
            {
                //
                // Test Ice.Override.ConnectTimeout.
                //
                var initData = new Ice.InitializationData();
                initData.properties = communicator.getProperties().clone();
                if(mult === 1)
                {
                    initData.properties.setProperty("Ice.Override.ConnectTimeout", "1000");
                }
                else
                {
                    initData.properties.setProperty("Ice.Override.ConnectTimeout", "4000");
                }
                comm = Ice.initialize(initData);
                to = Test.TimeoutPrx.uncheckedCast(comm.stringToProxy(ref));
                return timeout.holdAdapter(3000 * mult);
            }
        ).then(
            function()
            {
                return to.op();
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.ConnectTimeoutException);
                return timeout.op(); // Ensure adapter is active.
            }
        ).then(
            function()
            {
                return timeout.holdAdapter(3000 * mult);
            }
        ).then(
            function()
            {
                //
                // Calling ice_timeout() should have no effect on the connect timeout.
                //
                to = Test.TimeoutPrx.uncheckedCast(to.ice_timeout(3500 * mult));
                return to.op();
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.ConnectTimeoutException);
                return timeout.op(); // Ensure adapter is active.
            }
        ).then(
            function()
            {
                return to.op(); // Force connection.
            }
        ).then(
            function()
            {
                return to.sleep(4000 * mult);
            }
        ).then(
            failCB,
            function(ex)
            {
                test(ex instanceof Ice.TimeoutException);
                return comm.destroy();
            }
        ).then(
            function()
            {
                //
                // Test Ice.Override.CloseTimeout.
                //
                var initData = new Ice.InitializationData();
                initData.properties = communicator.getProperties().clone();
                initData.properties.setProperty("Ice.Override.CloseTimeout", "200");
                comm = Ice.initialize(initData);
                return comm.stringToProxy(ref).ice_getConnection();
            }
        ).then(
            function(con)
            {
                return timeout.holdAdapter(750);
            }
        ).then(
            function()
            {
                now = Date.now();
                return comm.destroy();
            }
        ).then(
            function()
            {
                var t = Date.now();
                test(t - now < 500);
                out.writeLine("ok");
                return timeout.shutdown();
            }
        ).then(
            function()
            {
                p.succeed();
            }
        );
        return p;
    };

    var run = function(out, id)
    {
        return Promise.try(
            function()
            {
                //
                // For this test, we want to disable retries.
                //
                id.properties.setProperty("Ice.RetryIntervals", "-1");

                //
                // We don't want connection warnings because of the timeout
                //
                id.properties.setProperty("Ice.Warn.Connections", "0");
                var c = Ice.initialize(id);
                return allTests(out, c).finally(
                    function()
                    {
                        if(c)
                        {
                            return c.destroy();
                        }
                    });
            });
    };
    global.__test__ = run;
    global.__runServer__ = true;
}(typeof (global) === "undefined" ? window : global));
