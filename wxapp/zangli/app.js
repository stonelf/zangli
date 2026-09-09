//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'test-943705',
      })
    }

    this.globalData = {}
  },
  onShow:function(data){
    this.globalData.onShowData=data;
  }
})
