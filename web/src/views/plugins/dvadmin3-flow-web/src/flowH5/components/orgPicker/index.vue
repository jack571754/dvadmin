<script lang="ts" setup>
import  { Popup as VanPopup,
  Button as VanButton,
  CheckboxGroup as VanCheckboxGroup,
  Checkbox as VanCheckbox,
  CellGroup as VanCellGroup,
  Cell as VanCell,
  Search as VanSearch,
  Tag as VanTag,
  Icon as VanIcon,
  Row as VanRow,
  Col as VanCol
} from 'vant'
import 'vant/lib/index.css';
import {computed, onMounted, ref} from "vue";
import XEUtils from 'xe-utils'
import axios from "axios";
const props = defineProps({
  show:Boolean,
  orgKey:String,
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
  multiple:Boolean,
  dataPermission:Boolean
})
const emit = defineEmits(['update:show','handleConfirm'])
const showPopup = computed({
  get() {
    if(props.show){
      orgPath.value.length = 1
      search.value = null
      checked.value = XEUtils.clone(props.selected,true)
      getOrgList(props.parentId)
    }
    return props.show
  },
  set(val) {
    emit('update:show', val)
  }
})
//数据列表
const dataList = computed(() => showSearch.value ? searchData.value : orgData.value)
const orgData = ref([])
// 搜索
const search = ref('')
const searchData = ref([])
function doSearch() {
  if (showSearch.value) {

    const locat = XEUtils.locat()
    const searchQuery = locat.searchQuery
    const token = searchQuery.token ||  XEUtils.cookie('token') || null
    // const domain = "http://127.0.0.1:8000"
    const domain = `${location.protocol}//${location.hostname}${location.port ? ':' : '/api'}${location.port}`;
    axios({
      url: `${domain}/api/dvadmin3_flow/flow_info/user_search/`,
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`
      },
      params: {userName: search.value}
    }).then(res=>{
      const rsp = res.data
      searchData.value = rsp.data
      reloadStatus(searchData.value)
    })


  }
}

// 回显
async function reloadStatus(orgs){
  if (checked.value.length > 0){
    for (let i in orgs) {
      let index = checked.value.findIndex(a => isSame(a, orgs[i]))
      if (index > -1){
        orgs[i] = checked.value[index]
      }
    }
  }
}

// 获取数据
const getOrgList = (deptId=null, call=null)=>{
  const locat = XEUtils.locat()
  const searchQuery = locat.searchQuery
  const token = searchQuery.token ||  XEUtils.cookie('token') || null
  const domain = `${location.protocol}//${location.hostname}${location.port ? ':' : '/api'}${location.port}`;
  // const domain = "http://127.0.0.1:8000"
  axios({
    url: `${domain}/api/dvadmin3_flow/flow_info/org_tree/`,
    method: 'GET',
    headers: {
      Authorization: `JWT ${token}`
    },
    params: {deptId: deptId, type: props.type,dataPermission:props.dataPermission}
  }).then(res=>{
    const rsp = res.data
    orgData.value = rsp.data
    //加载选中对象，解决UI框架回显对象问题
    reloadStatus(orgData.value)
    if (call) {
      call(rsp.data)
    }
  })
}

// 确定选择
const handleConfirm = ()=>{
  showPopup.value = false
  const _value = checked.value.map(v => {
    return {
      id: v.id,
      name: v.name,
      type: v.type,
      avatar: v.avatar
    }
  })
  emit('handleConfirm',{key:props.orgKey,value:_value})
}


//组织架构路径
const orgPath = ref([{id: props.parentId, name: ''}])
// 上级
const jumpDept=(dept, i)=>{
  orgPath.value.length = i + 1
  getOrgList(dept.id)
}



// 已选的值
const checked = ref([])
// 处理选中值
const handleChange = (val:any[])=>{
  if (!props.multiple) {
    checked.value = [val[val.length - 1]]
  }
}


// 是否相同
const isSame=(a, b)=>{
  return a.id === b.id && a.type === b.type
}

//全选处理
const selectAll = computed({
  get() {
    return dataList.value.every(b => checked.value.some(a => isSame(a, b)))
  },
  set(val) {
    //找出合适的类型的没有的元素
    const arr = dataList.value.filter(d => {
      const has = !checked.value.some(s => isSame(s, d))
      switch (props.type){
        case 'user': return has && d.type === 'user';
        case 'dept':
        case 'role': return has && props.type === d.type;
      }
      return true
    })
    if (val){
      checked.value.push(...arr)
    }else {
      //找出没有的元素
      checked.value = arr
    }
  }
})

// 未知状态
const indeterminate = computed(() => {
  return !selectAll.value && checked.value.some(b => dataList.value.some(a => isSame(a, b)))
})
const showSearch = computed(() => (search.value || '').trim() !== '')

// 上级
const toParentDept=()=>{
  jumpDept(orgPath.value[orgPath.value.length - 2], orgPath.value.length - 2)
}


const checkboxRefs = ref([]);
const toggle = (index) => {
  checkboxRefs.value[index].toggle();
};

// 下级
const handleSubOrg = (dept)=>{
  getOrgList(dept.id, rsp => {
    orgPath.value.push(dept)
  })
}



</script>

<template>
  <Teleport defer  to="#h5preview">
      <van-popup
          teleport="#h5preview"
          v-model:show="showPopup"
          position="bottom"
          round
          closeable
          :overlay-style="{position: 'absolute'}"
          :style="{ height: '500px',paddingTop: '10px',position: 'absolute' }"
      >
        <div>
<!--          标题-->
          <div style="text-align: center;font-size: 1.2em">选择{{props.type=='user'?'用户':'部门'}}</div>
<!--      搜索    -->
          <div>
            <van-search v-model="search" :disabled="type !== 'user' && type !== 'org'" placeholder="搜索人员，支持姓名"  @search="doSearch" />
          </div>
<!--          显示级别-->
          <div  v-if="type !== 'role'">
            <van-icon name="manager" size="24" />
            <template v-for="(org, i) in orgPath">
              <span v-if="i > 1"> > </span>
              <van-tag    @click="jumpDept(org, i)"
                          :type="i === orgPath.length - 1 ? 'primary' : 'success'">
                {{ org.name }}
              </van-tag>
            </template>
          </div>
          <div>
            <van-cell>
              <template #title>
                <van-checkbox v-model="selectAll" :indeterminate="indeterminate" style="padding: 0 5px"
                              :disabled="!(multiple  && type === 'user')">全选</van-checkbox>
              </template>
              <template #value>
                <span style="color: #0d84ff;" @click="toParentDept" v-if="!(orgPath.length <= 1 || showSearch)">
                  上级
                </span>
              </template>
            </van-cell>
          </div>
<!--          内容-->
          <div style="height: 260px;">
            <van-checkbox-group v-model="checked">
            <van-cell-group>
              <van-cell   v-for="(item, index) in dataList"  >
                <template #title>
                  <van-checkbox
                      :name="item"
                      :ref="el => checkboxRefs[index] = el"
                      @click="toggle(index)"
                  >{{item.name}}</van-checkbox>
                </template>
                <template #value v-if="item.type === 'dept'">
                  <span style="color: #0d84ff;" @click.stop="handleSubOrg(item)">下级</span>
                </template>
              </van-cell>
            </van-cell-group>
            </van-checkbox-group>
          </div>
<!--          已选择-->
          <div>
            <hr>
            <van-row>
              <van-col span="18">
                <span>已选：</span>
                <van-tag style="margin-right: 5px" v-for="item in checked">{{item.name}}</van-tag>
              </van-col>
              <van-col span="6">
                <VanButton type="success" style="width: 100%" size="small" @click="handleConfirm">确定</VanButton>
              </van-col>
            </van-row>
          </div>
        </div>
      </van-popup>
  </Teleport>
</template>

<style scoped lang="scss">

</style>