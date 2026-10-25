<template>
  <div class="user-import-btn" style="display: inline-block;">
    <el-button size="small" type="primary" @click="handleImport" class="mr5" v-auth="'user:Import'">
      <slot></slot>
    </el-button>
    <!-- 用户导入对话框 -->
    <el-dialog :title="uploadState.title" v-model="uploadState.open" width="400px" append-to-body>
      <el-upload
          ref="uploadRef"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="uploadState.headers"
          :action="uploadState.url + '?updateSupport=' + (uploadState.updateSupport ? 1 : 0)"
          :disabled="uploadState.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">{{ $t('message.components.importExcel.dragFileText') }}<em>{{ $t('message.components.importExcel.clickUploadText') }}</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="uploadState.updateSupport" />
              {{ $t('message.components.importExcel.updateTip') }}
            </div>
            <span>{{ $t('message.components.importExcel.fileFormatTip') }}</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">{{ $t('message.components.importExcel.downloadTemplateText') }}</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">{{ $t('message.components.importExcel.confirmText') }}</el-button>
          <el-button @click="uploadState.open = false">{{ $t('message.components.importExcel.cancelText') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="importExcel">
import { request, downloadFile } from '/@/utils/service';
import { inject, ref, reactive, watch } from "vue";
import { getBaseURL } from '/@/utils/baseUrl';
import { Session } from '/@/utils/storage';
import { ElMessageBox } from 'element-plus';
import type { Action } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const refreshView = inject<() => void>('refreshView');

const props = defineProps({
  upload: {
    type: Object,
    default () {
      return {
        open: false,
        title: '',
        isUploading: false,
        updateSupport: 0,
        headers: { Authorization: 'JWT ' + Session.get('token') },
        url: getBaseURL() + 'api/system/file/'
      }
    }
  },
  api: {
    type: String,
    default: ''
  }
});

const uploadState = reactive({
  open: false,
  title: '',
  isUploading: false,
  updateSupport: 0,
  headers: { Authorization: 'JWT ' + Session.get('token') },
  url: getBaseURL() + 'api/system/file/',
  ...props.upload,
});

watch(() => props.upload, (val) => {
  if (val) Object.assign(uploadState, val);
}, { deep: true });

const uploadRef = ref();
const loading = ref(false);

const handleImport = () => {
  uploadState.title = t('message.components.importExcel.dialogTitle');
  uploadState.open = true;
};

/** 下载模板操作 */
const importTemplate = () => {
  downloadFile({
    url: props.api + 'import_data/',
    params: {},
    method: 'get'
  });
};

/** 文件上传中处理 */
const handleFileUploadProgress = (_event: any, _file: any, _fileList: any) => {
  uploadState.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response: any, _file: any, _fileList: any) => {
  uploadState.open = false;
  uploadState.isUploading = false;
  uploadRef.value.clearFiles();
  loading.value = true;
  request({
    url: props.api + 'import_data/',
    method: 'post',
    data: {
      url: response.data.url
    }
  }).then(() => {
    loading.value = false;
    ElMessageBox.alert(t('message.components.importExcel.importSuccessMsg'), t('message.components.importExcel.importSuccess'), {
      confirmButtonText: 'OK',
      callback: (_action: Action) => {
        refreshView?.();
      },
    });
  }).catch(() => {
    loading.value = false;
  });
};

/** 提交上传文件 */
const submitFileForm = () => {
  uploadRef.value.submit();
};
</script>
