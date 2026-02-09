<script setup>
import WDialog from "./WDialog.vue";
import {computed, ref} from "vue";
import orgApi from '../../api/org'
import {deepCopy} from "../../utils/GlobalFunc";

const props = defineProps({
  title: {
    type: String,
    default: '请选择'
  },
  size: {
    default: 20
  },
  parentId: { //父级部门ID
    type: Number,
    default: 0
  },
  type: {
    type: String,
    default: 'org'
  },
  //选中的
  selected: {
    type: Array,
    default: () => {
      return []
    }
  },
  multiple: Boolean, //是否多选
  dataPermission:Boolean // 数据权限控制
})

const _value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})
defineExpose({open, close})
const emit = defineEmits(['update:modelValue', 'ok'])

const loading = ref(false)
const showDialog = ref(false)
//选中的对象
const selected = ref([])
const orgData = ref([])
const search = ref(null)
const searchData = ref([])

//组织架构路径
const orgPath = ref([{id: props.parentId, name: ''}])

const showSearch = computed(() => (search.value || '').trim() !== '')

//数据列表
const dataList = computed(() => showSearch.value ? searchData.value : orgData.value)

const indeterminate = computed(() => {
  return !selectAll.value && selected.value.some(b => dataList.value.some(a => isSame(a, b)))
})

//全选处理
const selectAll = computed({
  get() {
    return dataList.value.every(b => selected.value.some(a => isSame(a, b)))
  },
  set(val) {
    //找出合适的类型的没有的元素
    const arr = dataList.value.filter(d => {
      const has = !selected.value.some(s => isSame(s, d))
      switch (props.type){
        case 'user': return has && d.type === 'user';
        case 'dept':
        case 'role': return has && props.type === d.type;
      }
      return true
    })
    if (val){
      selected.value.push(...arr)
    }else {
      //找出没有的元素
      selected.value = arr
    }
  }
})

function isSame(a, b){
  return a.id === b.id && a.type === b.type
}

function open() {
  setTimeout(() => {
    orgPath.value.length = 1
    search.value = null
    getOrgList(props.parentId)
    selected.value = deepCopy(props.selected)
    showDialog.value = true
  }, 100)
}

function close() {
  showDialog.value = false
  //selected.value.length = 0
  orgPath.value.length = 1
}

function jumpDept(dept, i) {
  orgPath.value.length = i + 1
  let id = dept.id
  // 部门直接使用 id，不需要 dept_id 字段
  // dept_id 字段只在已选择的标签对象中使用
  getOrgList(id)
}

function toSubDept(dept) {
  let id = dept.id
  // 部门直接使用 id，不需要 dept_id 字段
  // dept_id 字段只在已选择的标签对象中使用
  getOrgList(id, rsp => {
    orgPath.value.push(dept)
  })
}

function toParentDept() {
  jumpDept(orgPath.value[orgPath.value.length - 2], orgPath.value.length - 2)
}

function doSearch() {
  if (showSearch.value) {
    loading.value = true
    orgApi.getUserByName({userName: search.value}).then(rsp => {
      loading.value = false
      searchData.value = rsp.data
      reloadStatus(searchData.value)
    }).catch(err => {
      loading.value = false
    })
  }
}

/**
 * 获取组织架构列表数据
 * @param deptId 父级部门ID
 * @param call 回调函数
 */
function getOrgList(deptId, call) {
  loading.value = true
  orgApi.getOrgTree({deptId: deptId, type: props.type,dataPermission:props.dataPermission}).then(rsp => {
    console.log(rsp)
    loading.value = false
    orgData.value = rsp.data
    //加载选中对象，解决UI框架回显对象问题
    reloadStatus(orgData.value)
    if (call) {
      call(rsp.data)
    }
  }).catch(err => {
    loading.value = false
  })
}

async function reloadStatus(orgs){
  if (selected.value.length > 0){
    for (let i in orgs) {
      let index = selected.value.findIndex(a => isSame(a, orgs[i]))
      if (index > -1){
        orgs[i] = selected.value[index]
      }
    }
  }
}

/**
 * 获取简短名称，只取末尾俩字符
 * @param name
 * @returns {*|string}
 */
function getShortName(name) {
  if ((name || '').length > 2) {
    return name.substring(name.length - 2, name.length)
  }
  return name
}

/**
 * 处理单选，强制单选
 * @param val 选中项集合
 */
function change(val) {
  if (!props.multiple) {
    selected.value = [val[val.length - 1]]
  }
}

function getValues(){
  return selected.value.map(v => {
    const result = {
      id: v.id,
      name: v.name,
      type: v.type,
      avatar: v.avatar
    }
    // 对于部门类型，添加 dept_id 字段（与 id 相同）
    // 这是为了后端保存审批人配置时使用
    if (v.type === 'dept') {
      result.dept_id = v.id
    }
    return result
  })
}

</script>

<template>
  <w-dialog :border="false" width="550" :title="title" v-model="showDialog"
            @ok="$emit('ok', getValues())">
    <el-row>
      <el-col :span="12" class="w-org-picker-span" v-loading="loading">
        <el-input v-model="search" @input="doSearch" class="w-org-picker-s-input" clearable
                  :disabled="type !== 'user' && type !== 'org'" placeholder="搜索人员，支持姓名" prefix-icon="search"/>
        <div class="w-org-picker-nav">
          <el-icon>
            <OfficeBuilding/>
          </el-icon>
          <el-scrollbar>
            <div class="w-org-list-path" v-if="type !== 'role'">
              <template v-for="(org, i) in orgPath">
                <span v-if="i > 1"> > </span>
                <el-text size="small" style="cursor: pointer" @click="jumpDept(org, i)"
                         :type="i === orgPath.length - 1 ? 'primary' : 'info'">
                  {{ org.name }}
                </el-text>
              </template>
            </div>
          </el-scrollbar>
        </div>
        <div class="w-org-list">
          <div>
            <el-checkbox v-model="selectAll" :indeterminate="indeterminate" style="padding: 0 5px"
                         :disabled="!(multiple  && type === 'user')">全选</el-checkbox>
            <el-button link type="primary" @click="toParentDept" :disabled="orgPath.length <= 1 || showSearch">
              <el-icon><TopLeft/></el-icon>上级
            </el-button>
          </div>

          <el-scrollbar v-if="dataList.length > 0">
            <el-checkbox-group v-model="selected" class="w-org-list-org" @change="change">
              <el-checkbox v-for="org in dataList" :disabled="type === 'user' && org.type === 'dept'"
                           :key="org.type + org.id" :label="org.name" :value="org">
                <el-avatar :size="35" :src="org.avatar" v-if="org.type === 'user'">{{ getShortName(org.name) }}
                </el-avatar>
<!--                <el-image class="w-org-dept-img" fit="fill" :src="`/image/${org.type}.png`"-->
<!--                          v-else-if="org.type !== 'user'"></el-image>-->
                <el-icon    v-else-if="org.type !== 'user'" color="#409EFF" size="30"><Platform /></el-icon>
                <el-text style="margin-left: 5px; flex: 1">{{ org.name }}</el-text>
                <el-button type="primary" link class="w-org-child" v-if="org.type === 'dept'" :underline="false"
                           @click="toSubDept(org)">下级
                  <el-icon>
                    <BottomRight/>
                  </el-icon>
                </el-button>
              </el-checkbox>
            </el-checkbox-group>
          </el-scrollbar>
          <el-empty v-else :image-size="100" description="未找到对应组织数据"/>
        </div>
      </el-col>
      <el-col :span="12" class="w-org-picker-span">
        <div>
          <span>已选 {{ selected.length }} 项</span>
          <el-button link type="danger" :disabled="selected.length === 0" @click="selected.length = 0">清空</el-button>
        </div>
        <el-scrollbar v-if="selected.length > 0">
          <div v-for="(org, i) in selected" class="w-org-picker-select">
            <el-avatar :size="35" :src="org.avatar" v-if="org.type === 'user'">{{ getShortName(org.name) }}</el-avatar>
            <el-image class="w-org-dept-img" fit="fill" :src="`/image/${org.type}.png`" v-else-if="org.type !== 'user'"/>
            <el-text style="margin-left: 5px; flex: 1">{{ org.name }}</el-text>
            <el-icon @click="selected.splice(i, 1)">
              <Close/>
            </el-icon>
          </div>
        </el-scrollbar>
        <el-empty v-else :image-size="100" description="未选中任何数据"/>
      </el-col>
    </el-row>
  </w-dialog>
</template>

<style scoped lang="less">
@import "../../assets/theme";
.w-org-picker-span {
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 1px solid var(--el-border-color);

  &:first-child {
    border-right: none;

    .w-org-picker-s-input {
      padding: 5px;
    }
  }

  &:last-child {
    & > :first-child {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      justify-content: space-between;
      border-bottom: 1px solid var(--el-border-color);
    }
  }

}

.w-org-picker-nav {
  padding: 0 5px;
  display: flex;
  align-items: center;

  i {
    margin-right: 5px;
  }
}

.w-org-dept-img {
  width: 20px;
  height: 20px;
  padding: 8px 0;
}

.w-org-picker-select {
  display: flex;
  align-items: center;
  padding: 3px 5px;

  .el-avatar {
    background-color: var(--el-color-primary);
  }

  i {
    cursor: pointer;
    padding: 5px;
  }

  &:hover {
    background-color: @theme-aside-bgc;
  }
}

:deep(.w-org-list-org) {
  display: flex;
  flex-direction: column;
  height: 275px;

  & > .el-checkbox {
    height: auto;
    padding: 3px 5px;
    margin-right: 0;

    &:hover {
      background-color: @theme-aside-bgc;
    }
  }

  .w-org-child {
    color: var(--el-color-primary);
  }

  .el-checkbox__label {
    display: flex;
    position: relative;
    flex: 1;
  }

  .el-avatar {
    background-color: var(--el-color-primary);
  }
}

.w-org-list {

  & > div:first-child {
    display: flex;
    align-items: center;
    position: relative;

    & > :first-child {
      flex: 1;
    }

    & > :last-child {
      margin-right: 5px;
    }
  }

  .w-org-list-path {
    display: flex;
  }
}
</style>
