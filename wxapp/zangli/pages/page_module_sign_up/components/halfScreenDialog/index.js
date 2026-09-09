// scene-module/signIn/components/half-sreen-Dialog/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    halfShow: {
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
    handleCloseHalfDialog() {
      this.triggerEvent('handleCloseHalfScreen');
    },
  },
});
