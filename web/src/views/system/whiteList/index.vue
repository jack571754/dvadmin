<template>
    <fs-page>
        <!-- 提醒框 -->
        <div class="whitelist-notice" v-if="showNotice">
            <div class="notice-close" @click="closeNotice">
                <el-icon><Close /></el-icon>
            </div>
            <p>接口白名单的主要作用是让某些接口不需要权限验证即可访问。</p>
            <p><strong>使用场景:</strong></p>
            <ul>
                <li>公开API(如登录接口、验证码接口)</li>
                <li>第三方系统调用的接口</li>
                <li>不需要登录即可访问的接口</li>
            </ul>
            <p><strong>假设你有一个统计报表接口 /api/system/dashboard/stats/:</strong></p>
            <ul>
                <li><strong>不加白名单:</strong>用户需要被分配该接口权限才能访问;即使有权限,也只能看到自己部门的数据</li>
                <li><strong>加入白名单(enable_datasource=False):</strong>所有登录用户都可以访问,不需要额外分配权限;可以看到全部数据,不受部门限制</li>
                <li><strong>加入白名单(enable_datasource=True):</strong>所有登录用户都可以访问;但仍受数据权限限制(只能看自己部门的数据)</li>
            </ul>
            <p class="notice-warning"><strong>️ 注意:</strong>白名单只绕过接口权限验证和数据权限过滤,并不会绕过登录认证。</p>
        </div>
        <fs-crud ref="crudRef" v-bind="crudBinding"></fs-crud>
    </fs-page>
</template>

<script lang="ts" setup name="whiteList">
import {ref, onMounted, watch} from 'vue';
import {useFs} from '@fast-crud/fast-crud';
import {createCrudOptions} from './crud';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';
import { Close } from '@element-plus/icons-vue';

const { themeConfig } = storeToRefs(useThemeConfig());
const {crudBinding, crudRef, crudExpose, resetCrudOptions} = useFs({createCrudOptions});

// 控制提醒框显示/隐藏
const showNotice = ref(true);

// 关闭提醒框
const closeNotice = () => {
    showNotice.value = false;
};

// 语言切换时重新构建 crud options
watch(
	() => themeConfig.value.globalI18n,
	() => {
		resetCrudOptions();
	}
);

// 页面打开后获取列表数据
onMounted(() => {
    crudExpose.doRefresh();
});
</script>

<style scoped lang="scss">
.whitelist-notice {
    background-color: var(--el-color-primary);
    color: #ffffff;
    padding: 16px 20px;
    margin: 10px 10px 15px 10px;
    border-radius: 4px;
    line-height: 1.8;
    font-size: 14px;
    position: relative;

    .notice-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        transition: background-color 0.3s;

        &:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }

        .el-icon {
            font-size: 16px;
        }
    }

    p {
        margin: 8px 0;

        &:first-child {
            margin-top: 0;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    strong {
        color: #ffffff;
        font-weight: 600;
    }

    ul {
        margin: 8px 0;
        padding-left: 20px;

        li {
            margin: 4px 0;
        }
    }

    .notice-warning {
        background-color: rgba(255, 255, 255, 0.15);
        padding: 8px 12px;
        border-left: 3px solid #ffc107;
        border-radius: 3px;
        margin-top: 12px;

        strong {
            color: #ffc107;
        }
    }
}
</style>
