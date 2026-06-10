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
            hero_title="Crafting digital experiences.",
            hero_role="产品设计专家 & 全栈开发者",
            hero_bio="我专注于复杂系统的体验设计与现代 Web 技术的融合。在这里，不仅是我的过往履历，也是我思考设计与工程边界的数字游乐场。",
            email="hello@yourdomain.com",
            social_proof="已交付 50+ 个项目 | 合作过金融、电商、SaaS 领域客户",
            is_active=True
        )
        print("初始化 PortfolioConfig 默认数据完成")

        # 2. 初始化履历时间线
        ResumeTimeline.objects.bulk_create([
            ResumeTimeline(
                role="高级体验设计专家 (UX/UI)",
                company="Global Tech Innovations Inc.",
                start_date="2021",
                end_date="至今",
                summary="主导企业级 SaaS 产品的核心体验架构与设计系统搭建。",
                achievements=[
                    "带领 5 人设计团队，从零构建并开源了公司的跨平台设计系统，提升了 40% 的研发交付效率。",
                    "重构数据看板核心模块，通过复杂信息的降噪处理，使用户关键任务操作时间缩短 25%。",
                    "主导与产品、工程团队的协同工作流标准化。"
                ],
                sort=1
            ),
            ResumeTimeline(
                role="产品交互设计师",
                company="Creative Agency Studio",
                start_date="2018",
                end_date="2021",
                summary="面向国际客户提供数字产品的从 0 到 1 体验设计。",
                achievements=[
                    "为 3 家头部金融科技初创公司设计移动端 App 界面与交互逻辑。",
                    "引入高级动效原型工具，向高管与投资人进行具象化的方案提案。",
                    "获得年度机构最佳跨界设计奖。"
                ],
                sort=2
            ),
            ResumeTimeline(
                role="独立开发者 & 自由撰稿人",
                company="Indie Hacker",
                start_date="2016",
                end_date="2018",
                summary="探索产品开发的全局链路，并建立个人影响力的初期阶段。",
                achievements=[
                    "独立开发并上线了两款提效工具（App Store & macOS），累计获取 50,000+ 活跃用户。",
                    "在各大技术/设计媒体持续输出高质量的深度分析长文。"
                ],
                sort=3
            ),
        ])
        print("初始化 ResumeTimeline 默认数据完成")

        # 3. 初始化作品与项目
        PortfolioItem.objects.bulk_create([
            PortfolioItem(
                title="数据分析平台的体验重构",
                category="case-study",
                summary="如何在一个包含数万个数据节点的企业级看板中，平衡信息密度与视觉呼吸感？这是我主导这次改版的核心思考。",
                result_tag="关键指标提升 25%",
                sort=1,
                is_recommend=True
            ),
            PortfolioItem(
                title="设计系统不再是组件库",
                category="essay",
                summary="探讨设计系统在 2024 年的演进：我们不只需要 UI Kit，更需要包含设计决策、无障碍标准与代码绑定的动态语言。",
                result_tag="开发效能提升 40%",
                sort=2,
                is_recommend=True
            ),
            PortfolioItem(
                title="WebGL 动态流体光影生成器",
                category="experiment",
                summary="基于 Three.js 和自定义着色器（Shaders）编写的网页互动实验，探讨非物理规律下的数字材质美学。",
                result_tag="PV 增长 150%",
                sort=3,
                is_recommend=True
            ),
            PortfolioItem(
                title="为什么我坚持手工写 HTML",
                category="essay",
                summary="在这个被建站工具 and 无代码包围的时代，探讨掌握底层原生技术的控制感与性能优势。",
                result_tag="首屏加载提速 80%",
                sort=4,
                is_recommend=False
            ),
            PortfolioItem(
                title="金融钱包 App: 从 0 到 1",
                category="case-study",
                summary="展示了我是如何通过用户访谈、线框图验证，最终交付包含 120+ 屏幕的高保真原型与微交互规范。",
                result_tag="客单价提升 15%",
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
