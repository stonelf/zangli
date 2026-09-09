Component({
  alias: '开关',
  externalClasses: ['ext-class'],
  options: {
    addGlobalClass: true,
  },

  properties: {
    name: {
      type: String,
      description: '在表单内提交的标志符',
    },
    color: {
      type: String,
      value: '#04BE02',
      description: '开关打开时的背景颜色',
    },
    checked: {
      type: Boolean,
      value: false,
      description: '开关选中状态',
    },
    disabled: {
      type: Boolean,
      value: false,
      description: '是否为禁用状态',
    },
    loading: {
      type: Boolean,
      value: false,
      description: '是否为加载状态',
    },
    size: {
      type: Number,
      value: 28,
      description: '开关尺寸',
    },
  },
  methods: {
    toggle() {
      const {
        checked,
        disabled,
        name,
      } = this.data;
      if (disabled) return;
      this.setData(
        {
          checked: !checked,
        },
        () => {
          const {
            checked,
          } = this.data;
          this.triggerEvent('change', {
            name,
            checked,
          });
        },
      );
    },
  },
});
