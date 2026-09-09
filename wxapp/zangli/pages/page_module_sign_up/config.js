const { PageModule } = require('@cloudbase/page-module');
const pageModule = new PageModule('tcb:sign_up');
const requestApi = async (methodName, params = {}) => {
  const objInfo = await pageModule.callMethod(methodName, params)
  const { result: { code, data } } = objInfo;
  if (code !== 0) {
    wx.showToast({
      title: '云函数调用出错',
    });
  }
  return data;
};

module.exports = {
  temId: 'eJ8NG1u50h13GiwfDpLtWBt42XekeY19yzmn5hPFr9o',  // 明天提醒订阅的模板 ID，这里根据你自己的申请的 ID进行修改 具体看 readme.md
  tag: 'continuous-weekly', // 项目 ID，具体看 readme.md
  page: 'pages/index/index', // 订阅提醒通知页要跳转到的小程序页面 具体看 readme.md
  requestApi,
};
