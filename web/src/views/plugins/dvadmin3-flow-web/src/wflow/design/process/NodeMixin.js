//节点复用逻辑
export default {
  props: {
    designData: Object,
    modelValue: Object,
    formItems: Object, //表单字段列表
    readonly: Boolean,
    index: Number, //处在当前支路位置的索引
    branch: Array, //当前整个支路
  },
  computed: {
    _value: function (props, emit){
      return {
        get() {
          return props.modelValue
        },
        set(val) {
          emit('update:modelValue', val)
        }
      }
    }
  },
  emits: ['update:modelValue', 'delete', 'insertNode', 'select']
}
