App({
  onLaunch(options) {
    // Travel Planner app initialization
    console.info('Travel Planner App onLaunch');
    
    // Initialize app-level data
    this.globalData = {
      userInfo: null,
      systemInfo: null
    };
    
    // Get system info
    my.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.info('System Info:', res);
      }
    });
  },
  
  onShow(options) {
    // App reopened from background
    console.info('Travel Planner App onShow');
  },
  
  onHide() {
    // App moved to background
    console.info('Travel Planner App onHide');
  },
  
  onError(error) {
    // App error handling
    console.error('Travel Planner App Error:', error);
  },
  
  globalData: {
    userInfo: null,
    systemInfo: null
  }
});
