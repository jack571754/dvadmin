<script setup>
import Node from "./base/Node.vue";
import {ElMessage} from "element-plus";
import {reloadNodeId} from "../../../../utils/ProcessUtil";
import nodeMixin from "../NodeMixin";
import nodeType, {NodeComponents} from "../ProcessNodes";
import {deepCopy} from "../../../../utils/GlobalFunc";
import {ref} from "vue";

const props = defineProps({
  ...nodeMixin.props
})

const emit = defineEmits(nodeMixin.emits)
defineExpose({ validate })
const branch_node = ref()

/**
 * 插入节点
 * @param branch 该节点要插入的支路（节点数组）
 * @param i 插入哪个元素后面的索引，实际插入位置为i+1
 * @param type 要插入的节点类型
 */
function insertNode(branch, i, type) {
  if (nodeType[type]) {
    branch.splice(i + 1, 0, nodeType[type].create(type))
  } else {
    ElMessage.warning('请在ProcessNodes.js内配置该节点')
  }
}

/**
 * 删除某个元素
 * @param branch 要删除的元素所在支路
 * @param i 删除的元素在该支路内索引位置
 */
function deleteNode(branch, i) {
  branch.splice(i, 1)
}

//添加网关分支
function addBranch() {
  const index = props.modelValue.branch.length - 1
  const type = props.modelValue.props.type
  if (nodeType[type]) {
    props.modelValue.props.branch.splice(index, 0, nodeType[type].createSelf(index + 1))
    props.modelValue.branch.splice(index, 0, [])
  } else {
    ElMessage.warning('请在ProcessNodes.js内配置该节点')
  }
}

//复制一个分支
function copyBranch(i) {
  //复制条件
  const cd = deepCopy(props.modelValue.props.branch[i])
  cd.name = cd.name + '-copy'
  //复制整个分支
  const bh = deepCopy(props.modelValue.branch[i])
  //重载节点id
  reloadNodeId(cd)
  reloadNodeId(bh)
  //插入到新位置
  props.modelValue.props.branch.splice(i + 1, 0, cd)
  props.modelValue.branch.splice(i + 1, 0, bh)
}

//删除网关分支
function deleteBranch(i) {
  if (props.modelValue.branch.length <= 2) {
    //只有两个分支，那么就直接删除整个网关
    emit('delete', props.branch, props.index)
  } else {
    //直接删除此分支
    props.modelValue.props.branch.splice(i, 1)
    props.modelValue.branch.splice(i, 1)
  }
}

//左移分支
function moveL(i) {
  exchange(props.modelValue.props.branch, i, i - 1)
  exchange(props.modelValue.branch, i, i - 1)
}

//右移分支
function moveR(i) {
  exchange(props.modelValue.props.branch, i, i + 1)
  exchange(props.modelValue.branch, i, i + 1)
}

//交换数组俩元素位置
function exchange(arr, si, ti) {
  const temp = arr[si]
  arr[si] = arr[ti]
  arr[ti] = temp
}

function select(nd, i){
  if (!(i === props.modelValue.branch.length - 1
      && props.modelValue.props.type !== 'Parallel')){
    emit('select', nd)
  }
}

function validate(errs){
  if (Array.isArray(branch_node.value)) {
    branch_node.value.forEach(ref => {
      if (ref.validate) {
        ref.validate(errs)
      }
    })
  } else if (branch_node.value && branch_node.value.validate){
    branch_node.value.validate(errs)
  }
}

</script>

<template>
  <div class="w-p-gateway">
    <div class="w-p-branch">
      <el-button class="w-p-gateway-add" round plain v-if="!readonly" @click="addBranch">添加分支</el-button>
      <!--分支遍历-->
      <div v-for="(nodes, i) in modelValue.branch" :key="i + '_br'"
           :class="{'w-p-branch-item': true, 'w-p-branch-item-l': i === 0,
            'w-p-branch-item-r': i === modelValue.branch.length - 1}">
        <div>
          <!--构造分支头节点-->
          <component ref="branch_node" :readonly="readonly" v-model="modelValue.props.branch[i]" :index="i"
                     :moveRn="i < modelValue.branch.length - (modelValue.props.type !== 'Parallel' ? 2 : 1)"
                     :moveLn="i > 0" :is="NodeComponents[modelValue.props.type]"
                     :isDefault="i === modelValue.branch.length - 1 && modelValue.props.type !== 'Parallel'"
                     @insertNode="type => insertNode(nodes,-1, type)"
                     @delete="deleteBranch(i)" @copy="copyBranch(i)"
                     @move-l="moveL(i)" @move-r="moveR(i)" @select="nd => select(nd, i)"/>
          <!--渲染分支-->
          <template v-for="(node, bi) in nodes" :key="bi + '_bi'">
            <!--分支里面继续遍历-->
            <component ref="branch_node" :readonly="readonly" v-model="modelValue.branch[i][bi]"
                       :is="NodeComponents[node.type]" :branch="nodes" :index="bi"
                       @insertNode="insertNode" @delete="deleteNode(nodes, bi)"
                       @select="nd => emit('select', nd)"/>
          </template>
        </div>
      </div>
    </div>
    <node :readonly="readonly" :class="{'w-p-branch-end': branch.length === index + 1}" :show-body="false"
          @insertNode="type => $emit('insertNode', branch, index, type)"/>
  </div>
</template>

<style scoped lang="less">
@import "../../../../assets/theme";
.w-p-gateway {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  .w-p-gateway-add {
    z-index: 2;
    top: -16px;
    position: absolute;
  }
}

.w-p-branch {
  display: flex;
  position: relative;
  justify-content: center;
  background: @main-bgc;

  //再画一个横线连接所有支路
  &:before {
    content: '';
    width: calc(100% - @node-width);
    background: @node-line-color;
    position: absolute;
    height: @node-line-width;
  }

  &:after {
    content: '';
    width: calc(100% - @node-width);
    background: @node-line-color;
    position: absolute;
    height: @node-line-width;
    bottom: 0;
  }

  .w-p-branch-item {
    position: relative;
    padding: 0 60px;
    display: flex;
    justify-content: center;

    & > div {
      z-index: 1; //防止连线跑到它上面
      margin-top: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;

      & > .w-p-node:last-child {
        :deep(.w-p-node-add) {
          //分支最后一个节点要去除箭头，影响美观
          &:after {
            display: none !important;
          }
        }
      }
    }

    &:before {
      content: '';
      position: absolute;
      background: @node-line-color;
      height: 100%;
      width: @node-line-width;
    }
  }

  .w-p-branch-item-l, .w-p-branch-item-r {
    &:after {
      //当分支不是偶数时，需要一个遮罩线
      content: '';
      position: absolute;
      height: @node-line-width;
      width: 50%;
      top: 0;
      background: @main-bgc;
    }

    & > div {
      &:before {
        //当分支不是偶数时，需要一个遮罩线
        content: '';
        position: absolute;
        height: @node-line-width;
        width: 50%;
        bottom: 0;
        background: @main-bgc;
      }
    }
  }

  :deep(.w-p-branch-end .w-p-node-add) {
    &:after {
      border: none;
    }
  }

  .w-p-branch-item-l {
    margin-left: 0;

    & > div {
      &:before {
        left: -1px;
      }
    }

    &:after {
      left: -1px;
    }
  }

  .w-p-branch-item-r {
    margin-right: 0;

    & > div {
      &:before {
        right: -1px;
      }
    }

    &:after {
      right: -1px;
    }
  }
}
</style>
