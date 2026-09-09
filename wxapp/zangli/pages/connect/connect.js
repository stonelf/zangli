// pages/connect/connect.js
var app = getApp();
var onShowData=app.globalData.onShowData;
var appId = onShowData.referrerInfo.appId,
extraData = onShowData.referrerInfo.extraData,
appUser = extraData.userId;
Page({
  data: {
    data:null,
    appName:null,
    alradyConnect:false
  },
  onLoad: function (options) {
    if(onShowData.scene == 1037){
      var appId = onShowData.referrerInfo.appId;
      wx.cloud.callFunction({
        name:'getAppInfo',
        data:{appId:appId}
      }).then(res=>{
        if(res.result){
          var data = {
            cmd:'query',
            app:appId,
            appUser:appUser
          }
          wx.cloud.callFunction({
            name:'connectUser',
            data:data
          }).then(count=>{
            if(count.result>0){
              this.setData({appName:res.result,alradyConnect:true})
            }else{
              this.setData({appName:res.result,alradyConnect:false})
            }
          })
        }else{
          //app未登记
        }
        console.log(res)
      })
    }else{
      this.setData({data:"打开方式("+onShowData.scene+")不对:\n"+JSON.stringify(app.globalData)})  
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  acceptConnect:function(){
    var data = {
      cmd:'add',
      app:appId,
      appUser:appUser
    }
    wx.cloud.callFunction({
      name:'connectUser',
      data:data
    }).then(res=>{
      if(res.result.errMsg == "collection.add:ok"){
        this.setData({alradyConnect:true})
      }else{
        console.log(res.result.errMsg)
      }
    })
  },
  jumpback:function(){
    wx.navigateBackMiniProgram({extraData: {result: 'success'}})
  },
  disconnect:function(){
    var data = {
      cmd:'disconnect',
      app:appId,
      appUser:appUser
    }
    wx.cloud.callFunction({
      name:'connectUser',
      data:data
    }).then(res=>{
      console.log(res.result.errMsg);//"document.remove:ok"
    })
    wx.navigateBackMiniProgram({extraData: {result: 'reject'}})
  },
  reject:function(){
    wx.navigateBackMiniProgram({extraData: {result: 'reject'}})
  }
})