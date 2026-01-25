<script setup>
import Nodes from "../../ProcessNodes";

const nodeList = Object.keys(Nodes)
    .filter(v => Nodes[v].name).map(v => {
      return {
        type: v,
        ...Nodes[v]
      }
    })

defineEmits(['insertNode'])
</script>

<template>
  <el-popover width="450" title="请选择流程节点" placement="right-start" trigger="click">
    <template #reference>
      <el-button type="primary" icon="plus" circle style="z-index: 1;"></el-button>
    </template>
    <div class="w-node-options">
      <div v-for="node in nodeList" :key="node.type" @click="$emit('insertNode', node.type)">
        <el-icon size="25" :style="{color: node.color}">
          <component :is="node.icon"/>
        </el-icon>
        {{node.name}}
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.w-node-options {
  display: flex;
  flex-wrap: wrap;

  i {
    padding: 3px;
    margin-right: 5px;
    border-radius: 10px;
    border: 1px solid #DEDFDF;
  }

  & > div {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 15px;
    background: #F8F9F9;
    margin: 5px;
    width: 110px;

    &:hover {
      box-shadow: 0 0 5px 0 #E3E3E3;
    }
  }
}
</style>
