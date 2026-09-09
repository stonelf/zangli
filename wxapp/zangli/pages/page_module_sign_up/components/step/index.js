// components/signIn/step.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {
    datas: {
      type: Array,
      value: [],
    },
    clockNum: {
      type: String,
      value: '',
    },
    // 是否开始签到
    signInStart: {
      type: Boolean,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleShowDialog(e) {
      const {
        status,
      } = e.currentTarget.dataset;
      this.triggerEvent('doSigIn', status);
    },
  },
});
