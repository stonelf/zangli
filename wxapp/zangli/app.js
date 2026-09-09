//app.js
// 全部历法计算在本地完成，不依赖云开发（原 wx.cloud.init 已移除）
App({
  onLaunch: function () {
    this.globalData = {}
  },
  onShow:function(data){
    this.globalData.onShowData=data;
  }
})
