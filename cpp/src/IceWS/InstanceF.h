// **********************************************************************
//
// Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************

#ifndef ICE_WS_INSTANCE_F_H
#define ICE_WS_INSTANCE_F_H

#include <IceUtil/Shared.h>
#include <Ice/Handle.h>

namespace IceWS
{

class Instance;
IceUtil::Shared* upCast(IceWS::Instance*);
typedef IceInternal::Handle<Instance> InstancePtr;

}

#endif
