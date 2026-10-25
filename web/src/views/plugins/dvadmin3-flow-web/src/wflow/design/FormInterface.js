/**
 * 表单接口，用来便于集成不同的表单，方便自由替换
 */
import {computed, ref} from "vue";

//表单的json对象
export const formJson = ref([]);
//表单ref对象
export const formRef = ref();
//表单内每个字段ID，与对应字段的配置
export const formItemMap = new Map()
//拍平以后的表单字段列表
export const _formFields = computed(() => resolveFormJson(formJson.value))

//表单渲染完毕
export var onRender;


//表单校验
export var validate;

/**
 * 表单初始化函数
 * @param ref 表单的ref
 * @param json 表单的json
 */
export const formInit = (ref, json) => {
  if (ref) {
    formRef.value = ref.value
  }
  formJson.value = json
}

/**
 * 加载表单组件选项
 * @param item 表单组件
 * @param items 集合
 * @param preName 前置名称
 * @param addItemFunc 添加的函数
 */
const loadFormItem = (item, items, preName, addItemFunc) => {
  formItemMap.set(item.id, item)
  if (Array.isArray(item)) {
    item.forEach(it => loadFormItem(it, items, null, addItemFunc))
  } else if (item.props.isContainer) {
    item.props.columns.forEach(it => loadFormItem(it, items, null, addItemFunc))
  } else if (item.type === 'TableList') {
    //处理表格
    addItemFunc(item, preName)
    item.props.columns.forEach(col => loadFormItem(col, items, item.name, addItemFunc))
  } else {
    addItemFunc(item, preName)
  }
}

/**
 * 获取表单数据
 * @returns {fieldId: 值} 表单值
 */
export function getFormData() {
  return {}
}

/**
 * 解析表单json，拍平成数组
 * @param json 表单json
 * @returns {*[]} 表单组件列表
 */
export const resolveFormJson = (json) => {
  let items = []
  formItemMap.clear()
  loadFormItem(json, items, null,  item => items.push(item))
  return items
}

/**
 * 获取表单字段列表
 * @returns [{表单字段信息}]
 */
export const getFormPermFields = (defaultPerm = 'R') => {
  let items = []
  formItemMap.clear() //清空map
  const addItem = (item, preName) => {
    items.push({
      id: item.id,
      key: item.key,
      name: `${preName ? preName + '.' : ''}${item.name}`,
      required: item.props.required,
      perm: item.perm ? item.perm : defaultPerm
    })
  }
  loadFormItem(formJson.value, items, null,  addItem)
  return items
}


/**
 * 显示表单字段
 * @param fieldIds 字段id列表
 */
export function showFields(fieldIds) {

}

/**
 * 隐藏表单字段
 * @param fieldIds 字段id列表
 */
export function hideFields(fieldIds) {

}

/**
 * 禁用表单字段
 * @param fieldIds 字段id列表
 */
export function disableFields(fieldIds) {

}

/**
 * 允许编辑表单字段
 * @param fieldIds 字段id列表
 */
export function enableFields(fieldIds) {

}
