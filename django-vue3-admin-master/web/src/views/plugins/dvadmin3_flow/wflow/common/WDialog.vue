<template>
  <el-dialog :class="{ 'w-dialog': true, 'w-dialog-border': border, 'w-fullscreen': fullscreen }"
      :width="width" :title="title" append-to-body :close-on-click-modal="clickClose"
      @opened="$emit('opened')" @closed="$emit('closed')"
      :destroy-on-close="closeFree" v-model="_value">
    <template #header>
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <div v-if="showFooter">
        <el-button size="default" @click="_value = false; $emit('cancel')">{{ cancelText }}</el-button>
        <el-button size="default" :icon="okLoading ? 'loading':''" :disabled="okLoading" type="primary"
                   @click="$emit('ok')">{{ okText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'WDialog',
  components: {},
  props: {
    title: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '50%',
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    clickClose: {
      type: Boolean,
      default: false,
    },
    closeFree: {
      type: Boolean,
      default: false,
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    cancelText: {
      type: String,
      default: '取 消',
    },
    okText: {
      type: String,
      default: '确 定',
    },
    okLoading: false,
    border: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    _value: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
  },
  data() {
    return {}
  },
  methods: {},
  emits: ['opened', 'closed', 'cancel', 'ok', 'update:modelValue'],
}
</script>

<style lang="less">
.w-dialog-border {
  .el-dialog__header {
    border-bottom: 1px solid var(--el-border-color);
  }

  .el-dialog__footer {
    border-top: 1px solid var(--el-border-color);
  }
}

.w-dialog {
  padding: 8px !important;

  .el-dialog__header {
    padding-bottom: 8px;
  }

  .el-dialog__footer {
    padding-top: 8px;
  }

  .el-dialog__body {
    padding: 10px 0;
  }
}

.w-fullscreen {
  overflow: hidden;
  margin-top: 0 !important;
  width: 100% !important;
  height: 100% !important;

  .el-dialog__body {
    padding: 0;
    height: calc(100vh - 94px);
  }
}
</style>
