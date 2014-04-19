LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)


LOCAL_MODULE := IceUtil

LOCAL_MODULE_FILENAME := libIceUtil

LOCAL_SRC_FILES := \
		  ArgVector.cpp \
		  Cond.cpp \
		  ConvertUTF.cpp \
		  CountDownLatch.cpp \
		  CtrlCHandler.cpp \
		  Exception.cpp \
		  FileUtil.cpp \
		  InputUtil.cpp \
		  Options.cpp \
		  OutputUtil.cpp \
		  Random.cpp \
		  RecMutex.cpp \
		  Shared.cpp \
		  StringUtil.cpp \
		  Thread.cpp \
		  ThreadException.cpp \
		  Time.cpp \
		  Timer.cpp \
		  UUID.cpp \
		  Unicode.cpp \
		  MutexProtocol.cpp

LOCAL_EXPORT_C_INCLUDES := \
	$(LOCAL_PATH)/..  $(LOCAL_PATH)/../../include

LOCAL_C_INCLUDES := \
	$(LOCAL_PATH)/.. \
	$(LOCAL_PATH)/../../include

include $(BUILD_STATIC_LIBRARY)

include $(CLEAR_VARS)

