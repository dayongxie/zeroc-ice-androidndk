LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := Ice

LOCAL_MODULE_FILENAME := libIce

LOCAL_SRC_FILES := \
		  Acceptor.cpp \
		  Application.cpp \
                  Base64.cpp \
		  Buffer.cpp \
		  BuiltinSequences.cpp \
		  BasicStream.cpp \
		  CommunicatorI.cpp \
		  Communicator.cpp \
		  ConnectRequestHandler.cpp \
		  ConnectionFactory.cpp \
		  ConnectionI.cpp \
		  ConnectionMonitor.cpp \
		  Connection.cpp \
		  ConnectionRequestHandler.cpp \
		  Connector.cpp \
		  Current.cpp \
		  DefaultsAndOverrides.cpp \
		  Direct.cpp \
                  DispatchInterceptor.cpp \
		  DynamicLibrary.cpp \
		  Endpoint.cpp \
		  EndpointFactoryManager.cpp \
		  EndpointFactory.cpp \
		  EndpointI.cpp \
		  EndpointTypes.cpp \
		  EventHandler.cpp \
		  Exception.cpp \
		  FacetMap.cpp \
		  FactoryTable.cpp \
		  FactoryTableInit.cpp \
		  GC.cpp \
		  Identity.cpp \
		  ImplicitContextI.cpp \
		  ImplicitContext.cpp \
		  IncomingAsync.cpp \
		  Incoming.cpp \
		  Initialize.cpp \
		  Instance.cpp \
		  LocalException.cpp \
		  LocalObject.cpp \
		  LocatorInfo.cpp \
		  Locator.cpp \
		  LoggerI.cpp \
		  Logger.cpp \
		  LoggerUtil.cpp \
		  Network.cpp \
		  ObjectAdapterFactory.cpp \
		  ObjectAdapterI.cpp \
		  ObjectAdapter.cpp \
		  ObjectFactoryManager.cpp \
		  ObjectFactory.cpp \
		  Object.cpp \
		  OpaqueEndpointI.cpp \
		  OutgoingAsync.cpp \
		  Outgoing.cpp \
		  PluginManagerI.cpp \
		  Plugin.cpp \
		  Process.cpp \
		  PropertiesI.cpp \
		  Properties.cpp \
		  PropertyNames.cpp \
		  Protocol.cpp \
		  ProtocolPluginFacade.cpp \
		  ProxyFactory.cpp \
		  Proxy.cpp \
		  ReferenceFactory.cpp \
		  Reference.cpp \
		  RetryQueue.cpp \
		  RequestHandler.cpp \
		  RouterInfo.cpp \
		  Router.cpp \
		  Selector.cpp \
		  ServantLocator.cpp \
		  ServantManager.cpp \
		  Service.cpp \
		  SliceChecksumDict.cpp \
		  SliceChecksums.cpp \
		  Stats.cpp \
		  StreamI.cpp \
		  Stream.cpp \
		  StringConverter.cpp \
		  SysLoggerI.cpp \
		  TcpAcceptor.cpp \
		  TcpConnector.cpp \
		  TcpEndpointI.cpp \
		  TcpTransceiver.cpp \
	          ThreadPool.cpp \
		  TraceLevels.cpp \
		  TraceUtil.cpp \
		  Transceiver.cpp \
		  UdpConnector.cpp \
		  UdpEndpointI.cpp \
		  UdpTransceiver.cpp

LOCAL_EXPORT_C_INCLUDES := \
	$(LOCAL_PATH)/..  $(LOCAL_PATH)/../../include

LOCAL_C_INCLUDES := \
	$(LOCAL_PATH)/..  $(LOCAL_PATH)/../../include

LOCAL_WHOLE_STATIC_LIBRARIES :=	bzip2 \
				iconv

include $(BUILD_STATIC_LIBRARY)

include $(CLEAR_VARS)

$(call import-module,../../../bzip2)
$(call import-module,../../../libiconv-1.14-android)
