<template>
  <div>
    <el-upload  :action="uploadUrl" :limit="config.props.maxNumber" with-credentials :multiple="config.props.maxSize > 0" :data="uploadParams"
               :auto-upload="true" :before-upload="beforeUpload" :on-success="handleSuccess" :on-remove="handleRemove">
      <el-button size="small" type="primary" :disabled="['free'].includes(mode)">选择文件</el-button>
      <template #tip>
        <div class="el-upload__tip">
          {{config.props.placeholder + sizeTip}}
        </div>
      </template>
    </el-upload>
  </div>
</template>
<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed, ref} from "vue";
import {getBaseURL} from "/@/utils/baseUrl";

const props = defineProps({
  ...FormComponentMixin.props
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))

const  sizeTip = computed(()=>{
  if (props.config.props.fileTypes.length > 0){
    return ` | 只允许上传[${String(this.fileTypes).replaceAll(",", "、")}]格式的文件，且单个附件不超过${props.config.props.maxSize}MB`
  }
  return props.config.props.maxSize > 0 ? ` | 单个附件不超过${props.config.props.maxSize}MB` : ''
})

const uploadParams = ref({})
const uploadUrl = getBaseURL() + 'api/system/file/'
const handleSuccess = (res, file, fileList) => {
  const {data} = res
  if(_value.value === undefined || _value.value.length === 0){
    _value.value = [data.file_url]
  }else{
    _value.value.push(data.file_url)
  }
}

const handleRemove = (file, fileList) => {
  if(fileList){
    _value.value = fileList.map(item=>item.response.data.file_url)
  }else {
    _value.value = []
  }
}


</script>


<style lang="less" scoped>

</style>
