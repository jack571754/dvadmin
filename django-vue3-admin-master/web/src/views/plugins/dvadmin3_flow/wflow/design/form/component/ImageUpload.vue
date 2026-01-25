<template>
  <div>
    <div v-if="['disabled'].includes(mode)">
      <el-image
          v-for="item in PreviewImgList"
          style="width: 100px; height: 100px;margin-right: 10px;border: 1px solid #eee;"
          :src="item"
          show-progress
          :preview-src-list="[item]"
          fit="cover"
      />
    </div>
    <div v-else>
      <el-upload list-type="picture-card"   :action="uploadUrl" :limit="config.props.maxSize" with-credentials :multiple="config.props.maxSize > 0" :data="uploadParams"
                 :auto-upload="true" :before-upload="beforeUpload" :on-success="handleSuccess" :on-remove="handleRemove"  :on-preview="handlePictureCardPreview">
        <el-button size="small" :icon="Plus" round :disabled="['free'].includes(mode)">选择图片</el-button>
        <template #tip>
          <div class="el-upload__tip">
            {{config.props.placeholder + sizeTip}}
          </div>
        </template>
      </el-upload>
    </div>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" />
    </el-dialog>

  </div>
</template>
<script setup>
import FormComponentMixin from "../FormComponentMixin";
import {computed, ref} from "vue";
import {getBaseURL} from "/@/utils/baseUrl";
import {Plus} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

const props = defineProps({
  ...FormComponentMixin.props
})
const emit = defineEmits([...FormComponentMixin.emits])
const _value = computed(FormComponentMixin.computed._value(props, emit))


const beforeUpload = (file) => {
  const allows = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  if (allows.indexOf(file.type) === -1){
    ElMessage.warning("存在不支持的图片格式")
  }else if(props.config.props.maxSize > 0 && file.size / 1024 / 1024 > props.config.props.maxSize){
    ElMessage.warning(`单张图片最大不超过 ${props.config.props.maxSize}MB`)
  }else {
    return true
  }
  return false
}

const  sizeTip = computed(()=>{
  return props.config.props.maxSize > 0 ? ` | 单个图片不超过${props.config.props.maxSize}MB` : ''
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

const PreviewImgList = computed(()=>{
  if(['disabled'].includes(props.mode)){

    return _value.value.map(item=>getBaseURL(item))
  }
  return []
})
const handleRemove = (file, fileList) => {
  if(fileList){
    _value.value = fileList.map(item=>item.response.data.file_url)
  }else {
    _value.value = []
  }
}

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const handlePictureCardPreview = (uploadFile) => {
  dialogVisible.value = true
  dialogImageUrl.value = getBaseURL() + uploadFile.response.data.file_url

}


</script>


<style lang="less" scoped>

</style>
