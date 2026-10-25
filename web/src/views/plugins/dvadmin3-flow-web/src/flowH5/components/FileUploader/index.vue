<template>
  <div>
    <van-field :name="config.key" :label="config.name">
      <template #input>
        <van-uploader  v-model="previewFileList" :after-read="afterRead" :before-delete="beforeDelete"  :multiple="config.props.maxSize > 0" :max-count="config.props.maxNumber" >

        </van-uploader>
      </template>
    </van-field>
  </div>
</template>

<script setup lang="ts">
import {Uploader as VanUploader, Field as VanField, Button as VanButton, showToast} from "vant"
import {request} from "/@/utils/service";
import axios from "axios";
import XEUtils from "xe-utils";
import {computed, ref, watch} from "vue";
const props = defineProps({
  config:Object
})
const emit = defineEmits(['updateImg'])

const previewFileList = ref([])
const FileList = ref([])
const afterRead = (file) => {
  const locat = XEUtils.locat()
  const searchQuery = locat.searchQuery
  const token = searchQuery.token ||  XEUtils.cookie('token') || null
  // 此时可以自行将文件上传至服务器
  console.log(file);
  const data = new FormData();
  data.append("file", file.file);
  const domain = `${location.protocol}//${location.hostname}${location.port ? ':' : '/api'}${location.port}`;
  return axios({
    url: `${domain}/api/system/file/`,
    method: "post",
    timeout: 60000,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `JWT ${token}`
    },
    data,
  }).then(res=>{
    const {data} = res
    showToast(data.msg)
    if(FileList.value.length===0){
      FileList.value = [data.data.file_url]
    }else{
      FileList.value.push(data.data.file_url)
    }
  })
};

const beforeDelete = (file,detail)=>{
  console.log(detail)
  const { index} = detail
  FileList.value.splice(index,1)
  return true
}

watch(FileList,()=>{
  emit('updateImg',{
    key:props.config.key,
    value:FileList.value
  })
})

</script>

<style scoped lang="scss">

</style>