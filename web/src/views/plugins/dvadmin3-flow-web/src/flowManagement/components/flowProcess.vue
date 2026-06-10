<template>
	<el-dialog v-model="processShow" width="80%" title="流程图">
		<process-render ref="processRender" :style="`transform: scale(${zoom / 100})`" v-model="processData" :readonly="true" />
	</el-dialog>
</template>
<script setup lang="ts">
import ProcessRender from '../../wflow/design/process/ProcessRender.vue';
import { computed, onMounted, ref } from 'vue';
import request from '../../api/request';

const props = defineProps({
	modelValue: Boolean,
	mainId: Object,
});
const emit = defineEmits(['update:modelValue']);

const processShow = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit('update:modelValue', val);
	},
});

const zoom = ref(100);
const processData = ref();

const getFlowProcess = () => {
	return request({
		url: `/api/dvadmin3_flow/flow_info/${props.mainId}/get_flow_process/`,
		method: 'get',
	}).then((res) => {
		const { data } = res;
		processData.value = data;
	});
};

onMounted(() => {
	getFlowProcess();
});
</script>

<style scoped lang="scss"></style>
