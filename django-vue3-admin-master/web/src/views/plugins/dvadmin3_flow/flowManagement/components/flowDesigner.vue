<template>
	<div>
		<el-drawer v-model="designerShow" size="80%" title="流程配置" append-to-body :close-on-click-modal="false" :close-on-press-escape="false" @close="closeClick">
			<form-process-designer v-model="designData" destroy-on-close></form-process-designer>
		</el-drawer>
	</div>
</template>

<script lang="ts" setup>
import FormProcessDesigner from '../../wflow/admin/FormProcessDesigner.vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import request from '../../api/request';

const route = useRoute();
const router = useRouter();
const designData = ref();

const props = defineProps({
	modelValue: Boolean,
	mainId: Number,
});
const emit = defineEmits(['update:modelValue','onClose','close']);

const designerShow = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit('update:modelValue', val);
	},
});

const getDesignData = () => {
	request({
		url: `/api/dvadmin3_flow/flow_info/${props.mainId}/`,
		method: 'get',
	}).then((res) => {
		const { data } = res;
		designData.value = data;
	});
};
const closeClick = () => {
  emit('close');
}
onMounted(() => {
	getDesignData()
});
</script>

<style scoped></style>
