import {defineAsyncComponent} from "vue";
const Components = import.meta.glob('./component/*.vue')
const ComponentConfigs = import.meta.glob('./config/*.vue')

//批量导出所有的component下面的表单组件
export const FormComponents = {}
Object.keys(Components).forEach((key) => {
  const name = key.replace(/^.+\/([^/]+)\.vue$/, '$1')
  FormComponents[name] = defineAsyncComponent(Components[key])
})

export const FormComponentConfigs = {}
Object.keys(ComponentConfigs).forEach((key) => {
  const name = key.replace(/^.+\/([^/]+)\.vue$/, '$1')
  FormComponentConfigs[name] = defineAsyncComponent(ComponentConfigs[key])
})

export const components = [
  {
    name: '布局组件',
    components: [
      {
        icon: 'tabler:layout-columns',
        type: 'SpanLayout',
        name: '分栏布局',
        props: {
          isContainer: true,
          span: 24,
          number: 2,
          gutter: 5,
          columns: []
        }
      }
    ]
  },
  {
    name: '基础组件',
    components: [
      {
        icon: 'iconamoon:edit',
        type: 'TextInput',
        name: '单行输入框',
        props: {
          required: false
        }
      },
      {
        name: '多行输入框',
        type: 'TextareaInput',
        icon: 'solar:list-down-line-duotone',
        props: {
          required: false,
          max: 255
        }
      },
      {
        name: '数字输入框',
        type: 'NumberInput',
        icon: 'tabler:123',
        key: null,
        props: {
          required: false,
        }
      },
      {
        name: '评分',
        type: 'Score',
        icon: 'fluent:star-12-regular',
        props: {
          required: false,
          color: '#f0a732',
          max: 5,
          showScore: true,
          enableHalf: false,
          icon: 'StarFilled',
        }
      },
      {
        name: '单选框',
        type: 'SinglePicker',
        icon: 'mdi:radiobox-marked',
        props: {
          required: false,
          expanding: false,
          options: ['选项1', '选项2'],
        }
      },
      {
        name: '多选框',
        type: 'MultiplePicker',
        icon: 'mingcute:multiselect-line',
        props: {
          required: false,
          expanding: false,
          options: ['选项1', '选项2']
        }
      },
      {
        name: '日期时间点',
        type: 'DateTimePicker',
        icon: 'material-symbols:calendar-clock-outline',
        props: {
          required: false,
          format: 'YYYY-MM-DD HH:mm'
        }
      },
      {
        name: '日期时间区间',
        type: 'DateTimeRangePicker',
        icon: 'material-symbols:calendar-month-outline',
        props: {
          required: false,
          placeholder: ['开始时间', '结束时间'],
          format: 'YYYY-MM-DD HH:mm',
          showLength: false
        }
      },
      {
        name: '上传附件',
        type: 'FileUpload',
        icon: 'material-symbols:calendar-month-outline',
        props: {
          placeholder:"上传附件",
          required: false,
          enablePrint: true,
          onlyRead: false, //是否只读，false只能在线预览，true可以下载
          maxSize: 100, //文件最大大小MB
          maxNumber: 3, //最大上传数量
          fileTypes: [] //限制文件上传类型
        }
      },
      {
        name: '上传图片',
        type: 'ImageUpload',
        icon: 'el-icon-picture-outline',
        props: {
          placeholder:"上传图片",
          required: false,
          maxSize: 100, //文件最大大小MB
          maxNumber: 3, //最大上传数量
        }
      },
      {
        icon: 'iconamoon:edit',
        type: 'IDCardInput',
        name: '身份证输入',
        key:'IDCard',
        props: {
          required: false,
        }
      },
      {
        name: '人员选择',
        type: 'UserPicker',
        icon: 'gravity-ui:persons',
        props: {
          required: false,
          multiple: false
        }
      },
      {
        name: '部门选择',
        type: 'DeptPicker',
        icon: 'fluent:organization-24-regular',
        props: {
          required: false,
          multiple: false
        }
      }
    ]
  },
  {
    name: '高级组件',
    components: [
      {
        name: '明细表',
        type: 'TableList',
        icon: 'mdi:table',
        props: {
          required: false,
          showBorder: true,
          showSummary: false,
          summaryColumns: [],
          maxSize: 0, //最大条数，为0则不限制
          columns:[] //列设置
        }
      }
    ]
  },
]

export default {
  components
}
