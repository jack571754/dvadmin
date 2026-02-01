"""
Django Management Command: 生成博客测试数据

使用方法:
    python manage.py generate_blog_data                    # 生成默认数量数据
    python manage.py generate_blog_data --articles 50      # 生成50篇文章
    python manage.py generate_blog_data --comments 200     # 生成200条评论
    python manage.py generate_blog_data --clean            # 清理旧数据后生成

依赖: pip install Faker
"""

import random
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from faker import Faker

from dvadmin.blog.models import Category, Tag, Article, Comment
from dvadmin.system.models import Users


class Command(BaseCommand):
    help = '生成博客管理的测试数据（分类、标签、文章、评论）'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fake = Faker(['zh_CN'])
        Faker.seed(54321)  # 设置随机种子，保证数据可复现

    def add_arguments(self, parser):
        parser.add_argument(
            '--categories',
            type=int,
            default=8,
            help='生成的分类数量，默认8个'
        )
        parser.add_argument(
            '--tags',
            type=int,
            default=15,
            help='生成的标签数量，默认15个'
        )
        parser.add_argument(
            '--articles',
            type=int,
            default=30,
            help='生成的文章数量，默认30篇'
        )
        parser.add_argument(
            '--comments',
            type=int,
            default=100,
            help='生成的评论数量，默认100条'
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help='清理旧数据后再生成'
        )

    def handle(self, *args, **options):
        categories_count = options['categories']
        tags_count = options['tags']
        articles_count = options['articles']
        comments_count = options['comments']
        clean = options['clean']

        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('开始生成博客测试数据...'))
        self.stdout.write(self.style.WARNING('=' * 60))

        if clean:
            self._clean_old_data()

        with transaction.atomic():
            # 步骤1: 生成分类
            categories = self._generate_categories(categories_count)
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(categories)} 个分类'))

            # 步骤2: 生成标签
            tags = self._generate_tags(tags_count)
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(tags)} 个标签'))

            # 步骤3: 生成文章
            articles = self._generate_articles(articles_count, categories, tags)
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(articles)} 篇文章'))

            # 步骤4: 生成评论
            comments = self._generate_comments(comments_count, articles)
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(comments)} 条评论'))

        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(f'完成！共生成: {len(categories)} 个分类, {len(tags)} 个标签, {len(articles)} 篇文章, {len(comments)} 条评论'))
        self.stdout.write(self.style.SUCCESS('=' * 60))

    def _clean_old_data(self):
        """清理旧数据"""
        self.stdout.write(self.style.WARNING('正在清理旧数据...'))
        Comment.objects.all().delete()
        Article.objects.all().delete()
        Tag.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('[OK] 旧数据已清理'))

    def _generate_categories(self, count):
        """生成文章分类"""
        # 预定义的分类数据
        categories_data = [
            {'name': 'Python开发', 'description': 'Python编程语言相关的技术文章，包括基础语法、框架应用、最佳实践等', 'sort': 1},
            {'name': '前端技术', 'description': '前端开发相关文章，涵盖Vue、React、Angular等主流框架', 'sort': 2},
            {'name': '后端架构', 'description': '后端架构设计与实现，包括微服务、分布式系统、高并发处理', 'sort': 3},
            {'name': '数据库技术', 'description': 'MySQL、PostgreSQL、MongoDB等数据库的技术文章', 'sort': 4},
            {'name': 'DevOps', 'description': 'DevOps实践，包括Docker、Kubernetes、CI/CD等', 'sort': 5},
            {'name': '人工智能', 'description': 'AI、机器学习、深度学习相关技术文章', 'sort': 6},
            {'name': '移动开发', 'description': 'iOS、Android、React Native、Flutter等移动开发技术', 'sort': 7},
            {'name': '技术随笔', 'description': '技术感悟、职业发展、学习方法等随笔文章', 'sort': 8},
        ]

        categories = []
        for data in categories_data[:count]:
            category, created = Category.objects.get_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'sort_order': data['sort'],
                    'is_active': True
                }
            )
            if created:
                categories.append(category)
            else:
                categories.append(category)

        # 如果需要更多分类，生成随机分类
        if count > len(categories_data):
            for i in range(len(categories_data), count):
                name = self.fake.word() + '开发'
                category = Category.objects.create(
                    name=name,
                    description=self.fake.text(max_nb_chars=100),
                    sort_order=i + 1,
                    is_active=True
                )
                categories.append(category)

        return categories

    def _generate_tags(self, count):
        """生成文章标签"""
        # 预定义的标签数据
        tags_data = [
            {'name': 'Python', 'color': '#3776AB'},
            {'name': 'Django', 'color': '#092E20'},
            {'name': 'Vue.js', 'color': '#42B883'},
            {'name': 'React', 'color': '#61DAFB'},
            {'name': 'TypeScript', 'color': '#3178C6'},
            {'name': 'Docker', 'color': '#2496ED'},
            {'name': 'Kubernetes', 'color': '#326CE5'},
            {'name': 'MySQL', 'color': '#4479A1'},
            {'name': 'Redis', 'color': '#DC382D'},
            {'name': 'MongoDB', 'color': '#47A248'},
            {'name': 'Linux', 'color': '#FCC624'},
            {'name': 'Git', 'color': '#F05032'},
            {'name': 'FastAPI', 'color': '#05998B'},
            {'name': 'PostgreSQL', 'color': '#336791'},
            {'name': 'Nginx', 'color': '#009639'},
        ]

        tags = []
        for data in tags_data[:count]:
            tag, created = Tag.objects.get_or_create(
                name=data['name'],
                defaults={'color': data['color']}
            )
            if created or tag not in tags:
                tags.append(tag)
            else:
                tags.append(tag)

        # 如果需要更多标签，生成随机标签
        if count > len(tags_data):
            colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#909399', '#C0C4CC']
            for i in range(len(tags_data), count):
                name = self.fake.word().capitalize()
                color = random.choice(colors)
                tag, created = Tag.objects.get_or_create(
                    name=name,
                    defaults={'color': color}
                )
                if created or tag not in tags:
                    tags.append(tag)

        return tags

    def _generate_articles(self, count, categories, tags):
        """生成文章"""
        # 文章标题模板
        title_templates = [
            '{tech}从入门到精通',
            '{tech}实战项目开发',
            '深入理解{tech}核心原理',
            '{tech}最佳实践指南',
            '{tech}性能优化技巧',
            '{tech}架构设计模式',
            '{tech}源码解析',
            '{tech}开发中遇到的问题与解决方案',
            '{tech}在企业项目中的应用',
            '{tech}学习路线图',
        ]

        # 技术栈列表
        tech_stack = [
            'Python', 'Django', 'FastAPI', 'Vue.js', 'React', 'TypeScript',
            'Docker', 'Kubernetes', 'MySQL', 'Redis', 'MongoDB', 'Linux',
            'Git', 'Nginx', 'PostgreSQL', 'Go', 'Rust', 'Spring Boot',
        ]

        # 获取管理员用户作为作者
        users = list(Users.objects.filter(is_superuser=True).filter(is_active=True))
        if not users:
            users = list(Users.objects.filter(is_active=True))
        if not users:
            # 如果没有用户，创建一个测试用户
            user = Users.objects.create_user(
                username='admin',
                password='admin123456',
                name='管理员',
                email='admin@example.com'
            )
            users = [user]

        articles = []
        for i in range(count):
            # 随机选择分类
            category = random.choice(categories)

            # 生成标题
            tech = random.choice(tech_stack)
            title = random.choice(title_templates).format(tech=tech)

            # 生成内容
            content = self._generate_article_content(tech)

            # 生成摘要
            summary = content[:200] + '...' if len(content) > 200 else content

            # 随机状态（70%已发布，30%草稿）
            status = 'published' if random.random() < 0.7 else 'draft'

            # 生成创建时间（近6个月内）
            create_datetime = self.fake.date_time_between(start_date='-6m', end_date='now')

            # 随机阅读量和点赞数
            views_count = random.randint(0, 5000) if status == 'published' else 0
            likes_count = random.randint(0, 200) if status == 'published' else 0

            # 是否置顶（前5篇有概率置顶）
            is_top = i < 5 and random.random() < 0.5

            # 创建文章
            article = Article(
                title=title,
                content=content,
                summary=summary,
                category=category,
                status=status,
                views_count=views_count,
                likes_count=likes_count,
                is_top=is_top,
            )
            # 手动设置创建者和创建时间
            article.creator = random.choice(users)
            article.create_datetime = create_datetime
            article.update_datetime = create_datetime + timedelta(days=random.randint(0, 30))
            article.save()

            # 添加标签（1-3个随机标签）
            article_tags = random.sample(tags, random.randint(1, min(3, len(tags))))
            article.tags.set(article_tags)

            articles.append(article)

        return articles

    def _generate_article_content(self, tech):
        """生成文章内容"""
        content = f"""# {tech}技术详解

## 引言

{self.fake.paragraph(nb_sentences=5)}

## 基础概念

{self.fake.paragraph(nb_sentences=4)}

{self.fake.paragraph(nb_sentences=3)}

### 核心特性

{self.fake.paragraph(nb_sentences=3)}

1. **特性一**: {self.fake.sentence()}
2. **特性二**: {self.fake.sentence()}
3. **特性三**: {self.fake.sentence()}

## 实战示例

```python
def example_function():
    '''示例代码'''
    result = "{self.fake.word()}"
    return result
```

## 最佳实践

{self.fake.paragraph(nb_sentences=4)}

### 注意事项

- {self.fake.sentence()}
- {self.fake.sentence()}
- {self.fake.sentence()}

## 总结

{self.fake.paragraph(nb_sentences=3)}

## 参考资料

- 官方文档: https://example.com/docs
- GitHub仓库: https://github.com/example/repo

---

*本文作者: {self.fake.name()}*
*发布时间: {self.fake.date()}*
"""
        return content

    def _generate_comments(self, count, articles):
        """生成评论"""
        # 获取活跃用户
        users = list(Users.objects.filter(is_active=True))
        if not users:
            # 如果没有用户，创建一些测试用户
            for i in range(5):
                user = Users.objects.create_user(
                    username=f'user{i+1}',
                    password='password123',
                    name=self.fake.name(),
                    email=f'user{i+1}@example.com'
                )
                users.append(user)

        # 评论内容模板
        comment_templates = [
            '写得很好，学到了很多！',
            '感谢分享，很有帮助。',
            '请问这个问题有更好的解决方案吗？',
            '按照文章操作遇到了一些问题，求解答。',
            '这篇文章很实用，已经收藏了。',
            '期待更多这样的文章。',
            '博主写得非常详细，赞！',
            '有个小疑问，能否详细说明一下？',
            '非常有用的教程，感谢作者！',
            '文章思路清晰，通俗易懂。',
            '希望能出更多进阶教程。',
            '这个技术我也在研究，有机会交流一下。',
        ]

        comments = []
        # 只为已发布的文章生成评论
        published_articles = [a for a in articles if a.status == 'published']

        if not published_articles:
            return comments

        for i in range(count):
            article = random.choice(published_articles)

            # 20%概率是回复评论
            parent = None
            if comments and random.random() < 0.2:
                # 选择该文章下的已有评论作为父评论
                article_comments = [c for c in comments if c.article_id == article.id]
                if article_comments:
                    parent = random.choice(article_comments)

            content = random.choice(comment_templates)
            if random.random() < 0.3:
                # 30%概率添加额外内容
                content += ' ' + self.fake.sentence()

            # 生成创建时间（在文章创建之后）
            article_time = article.create_datetime
            create_datetime = self.fake.date_time_between(start_date=article_time, end_date='now')

            comment = Comment(
                article=article,
                content=content,
                user=random.choice(users),
                parent=parent,
                is_active=True,
            )
            comment.create_datetime = create_datetime
            comment.save()

            comments.append(comment)

        return comments
