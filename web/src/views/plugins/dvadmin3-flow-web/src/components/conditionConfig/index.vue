<template>
    <div class="addRules">
        <div class="title-add">
            <div style="font-size: 1.2em;">{{ title }}</div>
            <div v-if="!onlyRead">
                <el-button type="primary" @click="onAddElseIf">新增</el-button>
            </div>
        </div>
        <div v-if="value_list.length > 0">
            <template v-for="(item, index) in value_list">
                <conditionCard v-model="value_list[index]" :onlyRead="onlyRead" @onRemove="onRemove(index)">
                </conditionCard>
            </template>
            <div class="condition-card">
                <div>否则</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import conditionCard from './conditionCard.vue'
const props = defineProps({
    onlyRead: Boolean,
    title: {
        type: String,
        default: '规则配置'
    }
})
const value_list = defineModel()
const onRemove = (index) => {
    value_list.value.splice(index, 1)
    if(value_list.value.length > 0) {
        value_list.value[0].type = 'default_if'
    }
}
const onAddElseIf = () => {
    if (value_list.value.length > 0) {
        value_list.value.push({
            type: 'default_elif',
            operate: 'and',
            context: [{
                field: null,
            }]
        })
    } else {
        value_list.value = [
            {
                type: 'default_if',
                operate: 'and',
                context: [{
                    field: ''
                }]
            }
        ]
    }
}
</script>

<style lang='scss' scoped>
.addRules {
    padding: 20px;
}

.title-add {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.condition-card {
    border: 1px solid #bbb;
    border-radius: 5px;
    padding: 10px;
    margin: 10px;
}
</style>