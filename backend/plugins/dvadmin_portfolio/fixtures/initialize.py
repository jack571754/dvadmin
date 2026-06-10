# 初始化
import os
import sys
import django

# 将后端根目录加入 PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "application.settings")
django.setup()

from dvadmin.system.fixtures.initSerializer import MenuInitSerializer
from dvadmin.utils.core_initialize import CoreInitialize
from dvadmin_portfolio.models import PortfolioConfig, ResumeTimeline, PortfolioItem

class Initialize(CoreInitialize):

    def init_menu(self):
        """
        初始化菜单信息
        """
        self.init_base(MenuInitSerializer, unique_fields=['name', 'web_path', 'component', 'component_name'])

    def init_default_data(self):
        """
        初始化个人履历及作品集的默认数据
        """
        # 清除旧数据，确保新增加的字段被正确录入
        PortfolioConfig.objects.all().delete()
        ResumeTimeline.objects.all().delete()
        PortfolioItem.objects.all().delete()

        # 1. 初始化个人设置
        PortfolioConfig.objects.create(
            name="H.",
            avatar="",
            hero_title="电商数字化建设与流程提效",
            hero_role="电商业务流程数字化专家 & 数据中台建设者",
            hero_bio="我专注于电商业务核心链路的数字化重构与多渠道数据整合。通过敏捷交付与规则引擎设计，用可量化的系统能力为业务降本增效。",
            email="hello@yourdomain.com",
            social_proof="主导 12 个大型电商系统交付 | 搭建 39 张报表数据中台 | 审批提速 300%+",
            is_active=True
        )
        print("初始化 PortfolioConfig 默认数据完成")

        # 2. 初始化履历时间线
        ResumeTimeline.objects.bulk_create([
            ResumeTimeline(
                role="数据中台负责人 / 数据中台建设者",
                company="某头部电商公司 - 数据服务部",
                start_date="2023",
                end_date="至今",
                summary="负责全平台销售数据汇总与实时监控看板体系的建设，覆盖12个主流业务线。",
                achievements=[
                    "整合京东、抖音、快手、拼多多、有赞等全渠道销售数据，成功打破数据孤岛。",
                    "规划并交付 39 张核心业务报表，实现对日更销售简报、核心单品日报、订单时效和货品效期的全方位实时监控体系。",
                    "为高管和各业务线运营团队提供敏捷决策支撑，显著缩短业务决策反馈链路。"
                ],
                sort=1
            ),
            ResumeTimeline(
                role="业务流程数字化专家 / 高级系统分析师",
                company="某头部电商公司 - 流程技术部",
                start_date="2021",
                end_date="2023",
                summary="主导电商业务核心高频人工环节的系统化审批与流程自动化升级。",
                achievements=[
                    "将退款折算与价格测算等传统繁琐的人工审批与计算，转化为标准化系统审批与规则引擎计算，使整体审批效率提速 300%+。",
                    "独立开发自动化寄样系统，将人工建单转换为流程自动化联动，成功释放 2 名全职员工的工作量。",
                    "主导建设达人管理系统与分销发货系统，实现多端资源的统一协作及订单自动化流转。"
                ],
                sort=2
            ),
            ResumeTimeline(
                role="敏捷项目经理 & 全栈工程师",
                company="敏捷技术服务中心",
                start_date="2018",
                end_date="2021",
                summary="以需求精准识别与 MVP 模式快速验证，实现电商辅助系统的高效极速交付。",
                achievements=[
                    "推行“精准需求识别 + MVP 快速验证 + 敏捷交付”模式，寄样系统 4 天完成交付，分销发货系统 6 天交付上线。",
                    "在 19 天内完成价格测算 2.0 系统的迭代研发，并在 23 天内完成价格测算-运营套组的上线与平稳运行。"
                ],
                sort=3
            ),
        ])
        print("初始化 ResumeTimeline 默认数据完成")

        # 3. 初始化作品与项目
        PortfolioItem.objects.bulk_create([
            PortfolioItem(
                title="自动化寄样系统",
                category="case-study",
                summary="针对传统人工建单寄样繁琐且数据孤立的问题，进行全自动系统化链路设计。4天内极速交付上线，全面替代人工寄样管理。",
                result_tag="释放 2 人全职工作量",
                sort=1,
                is_recommend=True
            ),
            PortfolioItem(
                title="多渠道电商数据中台",
                category="case-study",
                summary="整合拼多多、抖快、京东、有赞等多渠道大盘销售数据，搭建覆盖 12 个业务线的 39 张报表，支持日更销售简报与效期监控看板。",
                result_tag="整合 12 个业务线数据",
                sort=2,
                is_recommend=True
            ),
            PortfolioItem(
                title="规则引擎驱动的价格测算系统",
                category="case-study",
                summary="将复杂的运营测算、退款折算等纯手工审批与 Excel 计算转换为自动化系统规则，内置风控规则防止算错损失。",
                result_tag="审批效率提升 300%+",
                sort=3,
                is_recommend=True
            ),
            PortfolioItem(
                title="分销发货极速交付实践",
                category="experiment",
                summary="使用 MVP（最小可行性产品）模式对分销协作链路进行极限开发，于 6 天内快速交付并上线分销发货系统，零故障承接高并发订单。",
                result_tag="6 天内极速交付上线",
                sort=4,
                is_recommend=False
            ),
            PortfolioItem(
                title="多端统一的达人管理系统 2.0",
                category="case-study",
                summary="整合红人带货、分销资源、合同审批及佣金结算等全链路环节，打造多端信息互通的协作平台。",
                result_tag="资源协作提效 35%",
                sort=5,
                is_recommend=False
            ),
        ])
        print("初始化 PortfolioItem 默认数据完成")

    def run(self):
        self.init_menu()
        self.init_default_data()

if __name__ == "__main__":
    Initialize(app='dvadmin_portfolio').run()
