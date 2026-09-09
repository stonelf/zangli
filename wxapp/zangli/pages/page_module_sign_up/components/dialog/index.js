// components/signIn/Dialog/index.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    clockNum: {
      type: Number,
      value: '',
    },
    show: {
      type: Boolean,
      value: '',
    },
    btnBgColor: {
      type: String,
      value: '',
    },
    dialogBg: {
      type: String,
      value: '',
    },
    signStatus: {
      type: String,
      value: '',
    },
    prizeCon: {
      type: String,
      value: '',
    },
    btnCon: {
      type: String,
      value: '',
    },
    desc: {
      type: String,
      value: '',
    },
    isDesc: {
      type: Boolean,
      value: '',
    },
    isLottery: {
      type: Boolean,
      value: '',
    },
    lottery: {
      type: Boolean,
      value: '',
    },
    prizeData: {
      type: Array,
      value: [],
    },
    num: {
      type: Number,
      value: '',
    },
    type: {
      type: String,
      value: 'integral',
    },
    path: {
      type: String,
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
    // 关闭弹窗
    handleCloseDialog() {
      this.triggerEvent('handleClose');
    },

    // 立即抽奖事件
    start() {
      this.triggerEvent('handleLotteryStart');
    },
    subscription() {
      this.triggerEvent('subscription');
    }
  },
});
