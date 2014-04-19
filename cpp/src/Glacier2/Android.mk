LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE := Glacier2

LOCAL_MODULE_FILENAME := libGlacier2


LOCAL_SRC_FILES := ../Glacier2Lib/Application.cpp\
		  ../Glacier2Lib/Router.cpp \
		  ../Glacier2Lib/PermissionsVerifier.cpp \
		  ../Glacier2Lib/Session.cpp \
		  ../Glacier2Lib/SSLInfo.cpp \
		  Blobject.cpp \
		  ClientBlobject.cpp \
		  Instance.cpp \
		  ProxyVerifier.cpp \
		  RequestQueue.cpp \
		  RouterI.cpp \
		  RoutingTable.cpp \
		  FilterI.cpp \
		  FilterManager.cpp \
		  ServerBlobject.cpp \
		  SessionRouterI.cpp
		  
LOCAL_EXPORT_C_INCLUDES := \
	$(LOCAL_PATH)/..  $(LOCAL_PATH)/../../include

LOCAL_C_INCLUDES := \
	$(LOCAL_PATH)/..  $(LOCAL_PATH)/../../include

#LOCAL_LDLIBS := -lcocos2dx -lfreetype

#LOCAL_WHOLE_STATIC_LIBRARIES := \
#	cocos2dx_static
LOCAL_WHOLE_STATIC_LIBRARIES := iconv	

include $(BUILD_STATIC_LIBRARY)

include $(CLEAR_VARS)

$(call import-module,../../../libiconv-1.14-android)
