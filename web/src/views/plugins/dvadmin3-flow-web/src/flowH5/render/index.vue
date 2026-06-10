<template>
  <div>
    <div>{{formConfig}}</div>
    <x-form  ref="formRef" :model="formValue" :items="formConfig" :rules="formRules" >
      <template v-slot:[item]  v-for="item in slotOrgList" :key="item">
        <div>
          <div>item=>{{item}}</div>
          <div>{{formValue[item]}}</div>
          <van-tag style="margin-right: 5px" v-for="(tag,tagIndex) in formValue[item]" closeable @close="()=>removeTag(item,tagIndex)">{{tag.name}}</van-tag>
        </div>
      </template>
      <template v-slot:[item.key] v-for="item in slotList" :key="item.key">
        <div>
          <FileUploader v-if="['FileUpload','ImageUpload'].includes(item.type)" :config="item" @update-img="updateImg"></FileUploader>
        </div>
      </template>
    </x-form>
    <orgPicker v-if="orgPickerShow" v-model:show="orgPickerShow" v-model:orgKey="orgKey" v-bind="currentOrgConfig"  :selected="formValue[orgKey]" @handleConfirm="orgConfirm"></orgPicker>
    <div>
      <VanButton type="primary" @click="onSubmit" block>提交</VanButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {FormInstance,FieldRule} from 'vant'
import  { Button as VanButton,showFailToast,Tag as VanTag, Field as VanField, } from 'vant'
import 'vant/lib/index.css';
import { XForm } from '@meetjs/vant4-kit';
import '@meetjs/vant4-kit/dist/index.css'
import {ref, h, computed, reactive, toRaw} from 'vue'
import orgPicker from "../components/orgPicker/index.vue"
import FileUploader from "../components/FileUploader/index.vue"

const props = defineProps({
  formItems:{
    type:Object,
    default:()=>{
      return {
        components:[]
      }
    }
  }
})
const emit = defineEmits(['submitForm'])
const formRef=ref<FormInstance>()
const formValue = ref<any>({})
const formRules:{ [key:string]:FieldRule[] } = {

}

const componentType = reactive<any>({
  "TextInput": {
    "type": 'input',
  },
  "TextareaInput":{
    "type": 'input',
  },
  "NumberInput":{
    "type": 'stepper',
  },
  "Score":{
    "type": 'rate',
  },
  "SinglePicker":{
    "type": 'radio',
  },
  "MultiplePicker":{
    "type": 'checkbox',
  },
  "DateTimePicker":{
    "type": 'datetime-picker',
  },
  "DateTimeRangePicker":{
    "type": 'datetime-range-picker',
  },
  "DeptPicker":{
    "type": 'input-slot',
  },
  "UserPicker":{
    "type": 'input-slot',
  },
  "FileUpload":{
    "type": 'slot',
    "name":"FileUploader"
  },
  "ImageUpload":{
    "type": 'slot',
    "name":"FileUploader"
  },
  "IDCardInput":{
    "type": 'input'
  },
})

// 组织架构插槽
const slotOrgList = ref<any>([])
// 当前组织架构插件的配置
const currentOrgConfig = ref({})
// 插槽列表
const  slotList = ref([])

const formConfig = computed(()=> {
  const _formItems = []
  for (let item of props.formItems.components) {
    const type = item['type']
    const props = item['props']
    const componentTypeObj = Object.keys(toRaw(componentType))
    let items = <any>{}
    const key = item['key']
    if (componentTypeObj.includes(type)) {
      items = {
        "type": componentType[type]['type'],
        "label": item['name'],
        "name": key,
        "prop": key,
        "required": props['required']
      }
      if (["SinglePicker", "MultiplePicker"].includes(type)) {
        for (let op of props['options']) {
          items['options'] = {'text': op, 'value': op}
        }
      }

      if(["DeptPicker","UserPicker"].includes(type)){
        slotOrgList.value.push(key)
        if(items["required"]){
          items['rules'] = [
            { required:true, message: '必填项', trigger: ['onBlur'] }
          ]
        }
        items['itemProps'] = {
          "slots":{}
        }
        items['itemProps']['slots'][key] = {}
        items['itemProps'] = {
          "readonly":true,
          "slots": {
            'button': () => h(VanButton, { type: 'primary', size: 'small',onClick: ()=>handleOrgClick(key,item) }, '选择'),
          }
        }
      }

      if(["FileUpload","ImageUpload"].includes(type)){
        slotList.value.push(item)
      }

      // 身份证组件
      if(["IDCardInput"].includes(type)){
        const  validateIDCard = (value)=>{
          const regex = /^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
          if(value){
            return regex.test(value)
          }else{
            return true
          }
        }
        items['rules'] = [
          { validator: validateIDCard, message: '请输入正确的身份证', trigger: ['onBlur'] }
        ]
      }


    }
    _formItems.push(items)
  }
  return _formItems
})



const orgPickerShow = ref(false)
const orgKey = ref('')
const handleOrgClick = (key,item) => {
  orgPickerShow.value = true
  let componentType = 'org'
  if(item.type === 'DeptPicker'){
    componentType = 'dept'
  }
  if(item.type === 'UserPicker'){
    componentType = 'user'
  }
  orgKey.value = key
  currentOrgConfig.value ={
    type:componentType,
    multiple:item.props.multiple,
    dataPermission:item.props.dataPermission
  }
}

const orgConfirm = (orgs)=>{
  console.log("Org选择的值",orgs)
  const {key,value} = orgs
  formValue.value[key] = value
}

// 删除标签
const removeTag = (item,tagIndex) => {
  formValue.value[item].splice(tagIndex,1)
};

// 更新图片
const updateImg = (item)=>{
  formValue.value[item.key] = item.value
}

const onSubmit=()=>{
  formRef.value?.validate().then(()=>{
    // console.log('提交成功 =',formValue.value);
    emit('submitForm',formValue.value)
  }).catch(error=>{
    console.log('error',error);
    showFailToast('请检查表单填写')
  })
}
</script>
<style lang="scss" scoped>
</style>