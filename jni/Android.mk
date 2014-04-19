LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

#LOCAL_WHOLE_STATIC_LIBRARIES := libIce
#LOCAL_WHOLE_STATIC_LIBRARIES += libGlacier2

$(call import-module,Ice)
$(call import-module,Glacier2)
$(call import-module,IceUtil)

#include $(BUILD_STATIC_LIBRARY) 
