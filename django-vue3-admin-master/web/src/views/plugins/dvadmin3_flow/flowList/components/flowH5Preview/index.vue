<template>
  <el-button type="text" @click="onView()">H5端</el-button>
  <div>

    <el-dialog v-model="show" v-if="show" title="流程H5端">
      <div>
        <div style="margin-bottom: 5px;font-weight: bold;">链接</div>
        <el-input v-model="invitedUrl" readonly>
        </el-input>
        <el-button type="primary" style="margin-top: 5px" @click="copyUrl">复制链接</el-button>
        <el-divider></el-divider>
        <div style="margin-bottom: 5px;font-weight: bold;">访问二维码</div>
        <VueQr ref="qrcodeRef" :text="invitedUrl" :size="120" :margin="5" />
      </div>
    </el-dialog>
  </div>

</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import VueQr from "vue-qr/src/packages/vue-qr.vue";
import {ElMessage} from "element-plus";
import {getBaseURL} from "/@/utils/baseUrl";
import {cookie} from "xe-utils";
const props = defineProps({
  flowId:String
})

const invitedUrl = computed(()=>{
  const url = getBaseURL()
  let host_url: string
  const token = cookie.get('token')
  host_url =`${url}/api/dvadmin3_flow/flow_list_page/?token=${token}&flow_info_id=${props.flowId}`
  return host_url
})

const show = ref(false)
const onView = ()=>{
  show.value = true
}

const copyUrl = ()=>{
  const link = invitedUrl.value
  if (navigator.clipboard){
    navigator.clipboard.writeText(link).then(() => {
      alert("链接已成功复制到剪贴板！");
    }).catch(err => {
      console.error("复制失败: ", err);
    });
  }else{
    ElMessage.error("当前浏览器不支持复制")
  }
}

</script>

<style scoped lang="scss">

</style>