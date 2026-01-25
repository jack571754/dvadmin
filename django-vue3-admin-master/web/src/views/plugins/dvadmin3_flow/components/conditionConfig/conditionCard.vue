<template>
	<div class="condition-card" v-if="value_dict.context.length > 0">
		<div>
			<span style="font-size: 1.2em">{{ value_dict.type === 'default_if' ? '如果' : '否则如果' }}</span>
		</div>
		<div style="display: flex; align-items: center">
			<div style="width: 90px" v-if="value_dict.context.length > 1">
				<el-select v-model="value_dict.operate" placeholder="请选择" style="width: 60px" :disabled="onlyRead">
					<el-option v-for="(value, key) in operateDict" :key="value" :value="key" :label="value">
						{{ value }}
					</el-option>
				</el-select>
			</div>
			<div>
				<div class="condition-content" v-for="(row, index) in value_dict.context">
					<div v-if="index == 0" class="condition-line-top" :style="setLineStyle"></div>
					<div v-if="index == value_dict.context.length - 1" class="condition-line-bottom"
						:style="setLineStyle"></div>
          <div style="width: 100px">
            <el-select v-model="row.change">
              <el-option value="change_before" label="变化前"></el-option>
              <el-option value="change_after" label="变化后"></el-option>
            </el-select>
          </div>
					<div style="width: 120px">
						<el-select v-model="row.field" placeholder="请选择" filterable transfer :disabled="onlyRead">
							<el-option v-for="item in options" :key="item.key" :label="item.name"
								:value="item.key" />
						</el-select>
					</div>
          <div style="width: 100px">
            <el-select v-model="row.condition" clearable>
              <el-option value="is_null" label="为空"></el-option>
              <el-option value="is_not_null" label="不为空"></el-option>
              <el-option value="equal_to" label="等于"></el-option>
            </el-select>
          </div>
          <div style="width: 150px">
            <el-input v-model="row.field_value" placeholder="请输入" :disabled="['is_null','is_not_null'].includes(row.condition)"></el-input>
          </div>
					<div>
						<el-button v-if="value_dict.type == 'default_if' && !onlyRead" type="danger"
							@click="onRemove(index)">删除</el-button>
						<el-button v-if="value_dict.type == 'default_elif' && !onlyRead" type="danger"
							@click="onRemove(index)">删除</el-button>
					</div>
				</div>
			</div>
		</div>
		<el-button v-if="!onlyRead" type="primary" size="small" @click="onAdd">新增</el-button>
	</div>
</template>
<script lang="ts" setup>
import { computed, inject, ref,watch } from 'vue';
const props = defineProps({
	modelValue: Object,
	onlyRead: Boolean,
});
const options = inject('exempt_fields',[]);


const emit = defineEmits(['update:modelValue', 'onAdd', 'onRemove']);

const value_dict: any = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit('update:modelValue', val);
	},
});

const setLineStyle = computed(() => {
	if (value_dict.value.context.length === 1) {
		return {
			display: 'none',
		};
	} else if (value_dict.value.context.length <= 3) {
		return {
			height: (value_dict.value.context.length - 1) * 10 + 'px',
		};
	}
	return {
		height: (value_dict.value.context.length - 1) * 18 + 'px',
	};
});
const operateDict = ref({
	and: '且',
	or: '或',
});
const onAdd = () => {
	const record = {
		field: null
	};
	if (!value_dict.value.context) {
		value_dict.value.context = [record];
	} else {
		value_dict.value.context.push(record);
	}
	emit('onAdd');
};

const onRemove = (index: number) => {
	if(value_dict.value.context.length == 1) {
		emit('onRemove');
	}
	value_dict.value.context.splice(index, 1);
};
</script>
<style scoped lang="scss">
.condition-card {
	border: 1px solid #bbb;
	border-radius: 5px;
	padding: 10px;
	margin: 10px;
}

::v-deep.no-border-radius {
	border-right: 0;

	.el-select__wrapper {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
}

.condition-content {
	display: flex;
	gap: 10px;
	margin: 10px;
	position: relative;
}

.condition-line-top {
	position: absolute;
	display: inline-block;
	left: -50px;
	top: 10px;
	border-left: 1px solid #bbbbbb;
	border-top: 1px solid #bbbbbb;
	border-top-left-radius: 5px;
	width: 40px;
}

.condition-line-bottom {
	position: absolute;
	display: inline-block;
	left: -50px;
	bottom: 10px;
	border-left: 1px solid #bbbbbb;
	border-bottom: 1px solid #bbbbbb;
	border-bottom-left-radius: 5px;
	width: 40px;
}
</style>
