// **********************************************************************
//
// Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************

#include <Ice/TcpEndpointI.h>
#include <Ice/Network.h>
#include <Ice/TcpAcceptor.h>
#include <Ice/TcpConnector.h>
#include <Ice/TcpTransceiver.h>
#include <Ice/BasicStream.h>
#include <Ice/LocalException.h>
#include <Ice/ProtocolInstance.h>
#include <Ice/HashUtil.h>

using namespace std;
using namespace Ice;
using namespace IceInternal;

IceInternal::TcpEndpointI::TcpEndpointI(const ProtocolInstancePtr& instance, const string& ho, Int po, Int ti,
                                        const string& conId, bool co) :
    IPEndpointI(instance, ho, po, conId),
    _timeout(ti),
    _compress(co)
{
}

IceInternal::TcpEndpointI::TcpEndpointI(const ProtocolInstancePtr& instance) :
    IPEndpointI(instance),
    _timeout(-1),
    _compress(false)
{
}

IceInternal::TcpEndpointI::TcpEndpointI(const ProtocolInstancePtr& instance, BasicStream* s) :
    IPEndpointI(instance, s),
    _timeout(-1),
    _compress(false)
{
    s->read(const_cast<Int&>(_timeout));
    s->read(const_cast<bool&>(_compress));
}

EndpointInfoPtr
IceInternal::TcpEndpointI::getInfo() const
{
    class InfoI : public Ice::TCPEndpointInfo
    {
    public:
        
        InfoI(const EndpointIPtr& endpoint) : _endpoint(endpoint)
        {
        }

        virtual Ice::Short
        type() const
        {
            return _endpoint->type();
        }
        
        virtual bool
        datagram() const
        {
            return _endpoint->datagram();
        }
        
        virtual bool
        secure() const
        {
            return _endpoint->secure();
        }

    private:
        
        const EndpointIPtr _endpoint;
    };

    TCPEndpointInfoPtr info = new InfoI(const_cast<TcpEndpointI*>(this));
    fillEndpointInfo(info.get());
    return info;
}

Int
IceInternal::TcpEndpointI::timeout() const
{
    return _timeout;
}

EndpointIPtr
IceInternal::TcpEndpointI::timeout(Int timeout) const
{
    if(timeout == _timeout)
    {
        return const_cast<TcpEndpointI*>(this);
    }
    else
    {
        return new TcpEndpointI(_instance, _host, _port, timeout, _connectionId, _compress);
    }
}

bool
IceInternal::TcpEndpointI::compress() const
{
    return _compress;
}

EndpointIPtr
IceInternal::TcpEndpointI::compress(bool compress) const
{
    if(compress == _compress)
    {
        return const_cast<TcpEndpointI*>(this);
    }
    else
    {
        return new TcpEndpointI(_instance, _host, _port, _timeout, _connectionId, compress);
    }
}

bool
IceInternal::TcpEndpointI::datagram() const
{
    return false;
}

bool
IceInternal::TcpEndpointI::secure() const
{
    return false;
}

TransceiverPtr
IceInternal::TcpEndpointI::transceiver(EndpointIPtr& endp) const
{
    endp = const_cast<TcpEndpointI*>(this);
    return 0;
}

AcceptorPtr
IceInternal::TcpEndpointI::acceptor(EndpointIPtr& endp, const string&) const
{
    TcpAcceptor* p = new TcpAcceptor(_instance, _host, _port);
    endp = createEndpoint(_host, p->effectivePort(), _connectionId);
    return p;
}

string
IceInternal::TcpEndpointI::options() const
{
    //
    // WARNING: Certain features, such as proxy validation in Glacier2,
    // depend on the format of proxy strings. Changes to toString() and
    // methods called to generate parts of the reference string could break
    // these features. Please review for all features that depend on the
    // format of proxyToString() before changing this and related code.
    //
    ostringstream s;

    s << IPEndpointI::options();

    if(_timeout != -1)
    {
        s << " -t " << _timeout;
    }

    if(_compress)
    {
        s << " -z";
    }

    return s.str();
}

bool
IceInternal::TcpEndpointI::operator==(const LocalObject& r) const
{
    if(!IPEndpointI::operator==(r))
    {
        return false;
    }

    const TcpEndpointI* p = dynamic_cast<const TcpEndpointI*>(&r);
    if(!p)
    {
        return false;
    }

    if(this == p)
    {
        return true;
    }

    if(_timeout != p->_timeout)
    {
        return false;
    }

    if(_compress != p->_compress)
    {
        return false;
    }

    return true;
}

bool
IceInternal::TcpEndpointI::operator<(const LocalObject& r) const
{
    const TcpEndpointI* p = dynamic_cast<const TcpEndpointI*>(&r);
    if(!p)
    {
        const EndpointI* e = dynamic_cast<const EndpointI*>(&r);
        if(!e)
        {
            return false;
        }
        return type() < e->type();
    }

    if(this == p)
    {
        return false;
    }

    if(_timeout < p->_timeout)
    {
        return true;
    }
    else if(p->_timeout < _timeout)
    {
        return false;
    }

    if(!_compress && p->_compress)
    {
        return true;
    }
    else if(p->_compress < _compress)
    {
        return false;
    }

    return IPEndpointI::operator<(r);
}

void
IceInternal::TcpEndpointI::streamWriteImpl(BasicStream* s) const
{
    IPEndpointI::streamWriteImpl(s);
    s->write(_timeout);
    s->write(_compress);
}

void
IceInternal::TcpEndpointI::hashInit(Ice::Int& h) const
{
    IPEndpointI::hashInit(h);
    hashAdd(h, _timeout);
    hashAdd(h, _compress);
}

void
IceInternal::TcpEndpointI::fillEndpointInfo(IPEndpointInfo* info) const
{
    IPEndpointI::fillEndpointInfo(info);
    TCPEndpointInfo* tcpInfo = dynamic_cast<TCPEndpointInfo*>(info);
    if(tcpInfo)
    {
        tcpInfo->timeout = _timeout;
        tcpInfo->compress = _compress;
    }
}

bool
IceInternal::TcpEndpointI::checkOption(const string& option, const string& argument, const string& endpoint)
{
    if(IPEndpointI::checkOption(option, argument, endpoint))
    {
        return true;
    }

    switch(option[1])
    {
    case 't':
    {
        if(argument.empty())
        {
            EndpointParseException ex(__FILE__, __LINE__);
            ex.str = "no argument provided for -t option in endpoint " + endpoint;
            throw ex;
        }
        istringstream t(argument);
        if(!(t >> const_cast<Int&>(_timeout)) || !t.eof())
        {
            EndpointParseException ex(__FILE__, __LINE__);
            ex.str = "invalid timeout value `" + argument + "' in endpoint " + endpoint;
            throw ex;
        }
        return true;
    }

    case 'z':
    {
        if(!argument.empty())
        {
            EndpointParseException ex(__FILE__, __LINE__);
            ex.str = "unexpected argument `" + argument + "' provided for -z option in " + endpoint;
            throw ex;
        }
        const_cast<bool&>(_compress) = true;
        return true;
    }

    default:
    {
        return false;
    }
    }
}

ConnectorPtr 
IceInternal::TcpEndpointI::createConnector(const Address& address, const NetworkProxyPtr& proxy) const
{
    return new TcpConnector(_instance, address, proxy, _timeout, _connectionId);
}

IPEndpointIPtr 
IceInternal::TcpEndpointI::createEndpoint(const string& host, int port, const string& connectionId) const
{
    return new TcpEndpointI(_instance, host, port, _timeout, connectionId, _compress);
}

IceInternal::TcpEndpointFactory::TcpEndpointFactory(const ProtocolInstancePtr& instance) : _instance(instance)
{
}

IceInternal::TcpEndpointFactory::~TcpEndpointFactory()
{
}

Short
IceInternal::TcpEndpointFactory::type() const
{
    return _instance->type();
}

string
IceInternal::TcpEndpointFactory::protocol() const
{
    return _instance->protocol();
}

EndpointIPtr
IceInternal::TcpEndpointFactory::create(vector<string>& args, bool oaEndpoint) const
{
    IPEndpointIPtr endpt = new TcpEndpointI(_instance);
    endpt->initWithOptions(args, oaEndpoint);
    return endpt;
}

EndpointIPtr
IceInternal::TcpEndpointFactory::read(BasicStream* s) const
{
    return new TcpEndpointI(_instance, s);
}

void
IceInternal::TcpEndpointFactory::destroy()
{
    _instance = 0;
}

EndpointFactoryPtr 
IceInternal::TcpEndpointFactory::clone(const ProtocolInstancePtr& instance) const
{
    return new TcpEndpointFactory(instance);
}
