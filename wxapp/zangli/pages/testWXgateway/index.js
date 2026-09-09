// pages/testWXgateway/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.cloud.callContainer({
      path: '/test.txt?x=1', // 透传到后台服务
      header: {
         'X-WX-REGION': 'ap-shanghai', // 网关所在地域，不填默认是上海
        // 默认不获取unionid 和 access-token， 提升链路性能
        'X-WX-EXCLUDE-CREDENTIALS': 'unionid, cloudbase-access-token, openid',
        'X-WX-GATEWAY-ID': 'wxgateway-5gkip8u0108404e5', // 微信网关ID
        'HOST': 'test.sou.ac.cn', // 网关服务地址
      },
      method: 'GET',
      dataType: 'text'
    }).then((res) => {
      const { errMsg,statusCode,data } = res;
      wx.showModal({
        title: `${errMsg} | ${statusCode}`,
        content: data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})