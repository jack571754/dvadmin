<script setup>
import {computed, reactive, ref} from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => {
      return []
    }
  },
  disabled: {
    default: false
  },
  size: {
    default: 20
  },
  inline: Boolean
})

const _value = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const emit = defineEmits(['update:modelValue'])
//用户、部门、角色信息缓存，减少访问提升性能
const orgCatch = reactive({
  user: {},
  dept: {},
  role: {}
})
const orgInfos = computed(() => {
  let infos = {...orgCatch}
  //拿到所有id,type关系，去接口取name和头像值
  const orgs = _value.value.filter(v => (orgCatch[v.type] || {})[v.id] === undefined)
  if (orgs.length > 0){
    getUserAvatarByIds(orgs).then(res => {
      res.forEach(v => {
        if (v.type === 'role'){
          v.avatar = './image/role.png'
        } else if (v.type === 'dept'){
          v.avatar = './image/dept.png'
        }
        infos[v.type][v.id] = v
        orgCatch[v.type][v.id] = v
      })
    })
  }
  return infos
})

//请求后端接口去拿用户信息
function getUserAvatarByIds(orgs){
  return new Promise((resolve, reject) => {
    resolve(orgs)
  })
}

function getShortName(name){
  if ((name || '').length > 2){
    return name.substring(name.length - 2, name.length)
  }
  return name
}

function getAvatar(org){
  if (orgInfos.value[org.type] && orgInfos.value[org.type][org.id]){
    return orgInfos.value[org.type][org.id].avatar
  }
  return null
}

</script>

<template>
  <div :style="{display: inline ? 'inline-block' : 'block'}">
    <div class="w-org-items">
      <div v-for="(org, i) in _value" :key="i">
        <el-avatar :size="size" :class="'w-avatar-' + org.type" :src="getAvatar(org)">
          <span>{{getShortName(org.name)}}</span>
        </el-avatar>
        <el-text size="small" style="height: 20px; line-height: 20px">{{ org.name }}</el-text>
        <el-icon size="10" @click="_value.splice(i, 1)"><Close/></el-icon>
      </div>
  </div>
</div>
</template>

<style scoped lang="less">
@import "../../assets/theme";
.w-org-items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  &>div {
    display: flex;
    align-items: center;
    margin: 5px;
    padding:3px 5px;
    border-radius: 15px;
    background-color: @main-bgc;

    .w-avatar-user {
      background-color: var(--el-color-primary);
    }

    .w-avatar-dept, .w-avatar-role {
      background: none;
    }

    .el-avatar {
      margin-right: 3px;
      span {
        transform: scale(0.5);
        position: absolute;
        display: flex;
        align-items: center;
      }
    }

    i {
      cursor: pointer;
      padding: 2px;
      margin-left: 2px;

      &:hover {
        background-color: #c4c4c4;
        border-radius: 50%;
      }
    }
  }
}
</style>
