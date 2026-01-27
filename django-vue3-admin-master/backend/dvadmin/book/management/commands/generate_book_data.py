"""
Django Management Command: 生成图书测试数据

使用方法:
    python manage.py generate_book_data                    # 生成100条默认数据
    python manage.py generate_book_data --count 200        # 生成200条数据
    python manage.py generate_book_data --clean            # 清理旧数据后生成
    python manage.py generate_book_data --count 50 --clean # 清理后生成50条

依赖: pip install Faker
"""

import random
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker

from dvadmin.book.models import Book, BookCategory, BookPublisher, BookAuthor


class Command(BaseCommand):
    help = '生成图书管理的测试数据（分类、出版社、作者、图书）'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fake = Faker(['zh_CN'])
        Faker.seed(12345)  # 设置随机种子，保证数据可复现

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='生成的图书数量，默认100条'
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help='清理旧数据后再生成'
        )

    def handle(self, *args, **options):
        count = options['count']
        clean = options['clean']

        self.stdout.write(self.style.WARNING(f'开始生成图书测试数据...'))

        if clean:
            self._clean_old_data()

        with transaction.atomic():
            # 步骤1: 生成分类
            categories = self._generate_categories()
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(categories)} 个分类'))

            # 步骤2: 生成出版社
            publishers = self._generate_publishers()
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(publishers)} 个出版社'))

            # 步骤3: 生成作者
            authors = self._generate_authors()
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(authors)} 个作者'))

            # 步骤4: 生成图书
            books = self._generate_books(count, categories, publishers, authors)
            self.stdout.write(self.style.SUCCESS(f'[OK] 生成 {len(books)} 本图书'))

        self.stdout.write(self.style.SUCCESS(f'\n完成！共生成 {len(books)} 本图书'))

    def _clean_old_data(self):
        """清理旧数据"""
        self.stdout.write(self.style.WARNING('正在清理旧数据...'))
        Book.objects.all().delete()
        BookAuthor.objects.all().delete()
        BookPublisher.objects.all().delete()
        BookCategory.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('[OK] 旧数据已清理'))

    def _generate_categories(self):
        """生成图书分类"""
        categories_data = [
            # 编程语言类
            {'name': 'Python', 'code': 'PY001', 'sort': 1, 'description': 'Python编程语言相关书籍'},
            {'name': 'Java', 'code': 'JV001', 'sort': 2, 'description': 'Java编程语言相关书籍'},
            {'name': 'JavaScript', 'code': 'JS001', 'sort': 3, 'description': 'JavaScript编程语言相关书籍'},
            {'name': 'Go语言', 'code': 'GO001', 'sort': 4, 'description': 'Go编程语言相关书籍'},
            {'name': 'Rust', 'code': 'RS001', 'sort': 5, 'description': 'Rust编程语言相关书籍'},
            {'name': 'C/C++', 'code': 'CP001', 'sort': 6, 'description': 'C/C++编程语言相关书籍'},

            # 框架技术类
            {'name': 'Django', 'code': 'DJ001', 'sort': 7, 'description': 'Django Web框架相关书籍'},
            {'name': 'Spring Boot', 'code': 'SB001', 'sort': 8, 'description': 'Spring Boot框架相关书籍'},
            {'name': 'Vue.js', 'code': 'VU001', 'sort': 9, 'description': 'Vue.js前端框架相关书籍'},
            {'name': 'React', 'code': 'RE001', 'sort': 10, 'description': 'React前端框架相关书籍'},

            # 数据库类
            {'name': 'MySQL', 'code': 'MY001', 'sort': 11, 'description': 'MySQL数据库相关书籍'},
            {'name': 'PostgreSQL', 'code': 'PG001', 'sort': 12, 'description': 'PostgreSQL数据库相关书籍'},
            {'name': 'Redis', 'code': 'RD001', 'sort': 13, 'description': 'Redis缓存相关书籍'},
            {'name': 'MongoDB', 'code': 'MG001', 'sort': 14, 'description': 'MongoDB数据库相关书籍'},

            # 云原生/DevOps
            {'name': 'Docker', 'code': 'DK001', 'sort': 15, 'description': 'Docker容器技术相关书籍'},
            {'name': 'Kubernetes', 'code': 'K8001', 'sort': 16, 'description': 'Kubernetes容器编排相关书籍'},
            {'name': 'CI/CD', 'code': 'CD001', 'sort': 17, 'description': '持续集成/持续部署相关书籍'},

            # AI/大数据
            {'name': '机器学习', 'code': 'ML001', 'sort': 18, 'description': '机器学习相关书籍'},
            {'name': '深度学习', 'code': 'DL001', 'sort': 19, 'description': '深度学习相关书籍'},
            {'name': '大数据', 'code': 'BD001', 'sort': 20, 'description': '大数据技术相关书籍'},
        ]

        categories = []
        for data in categories_data:
            category, _ = BookCategory.objects.get_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'sort': data['sort'],
                    'description': data['description'],
                    'status': True
                }
            )
            categories.append(category)

        return categories

    def _generate_publishers(self):
        """生成出版社"""
        publishers_data = [
            # 国内出版社
            {'name': '人民邮电出版社', 'code': 'P001', 'address': '北京市丰台区成寿寺路11号'},
            {'name': '机械工业出版社', 'code': 'P002', 'address': '北京市西城区百万庄大街22号'},
            {'name': '清华大学出版社', 'code': 'P003', 'address': '北京市海淀区清华园'},
            {'name': '电子工业出版社', 'code': 'P004', 'address': '北京市万寿路南口金家村288号'},
            {'name': '中国水利水电出版社', 'code': 'P005', 'address': '北京市西城区三里河路6号'},
            {'name': '北京大学出版社', 'code': 'P006', 'address': '北京市海淀区颐和园路5号'},
            {'name': '浙江人民出版社', 'code': 'P007', 'address': '浙江省杭州市体育场路347号'},
            {'name': '华中科技大学出版社', 'code': 'P008', 'address': '湖北省武汉市珞喻路1037号'},

            # 国外出版社
            {'name': "O'Reilly Media", 'code': 'P009', 'address': '1005 Gravenstein Highway North, Sebastopol, CA'},
            {'name': 'Packt Publishing', 'code': 'P010', 'address': 'Birmingham, UK'},
            {'name': 'Manning Publications', 'code': 'P011', 'address': 'Shelter Island, NY'},
            {'name': 'Addison-Wesley', 'code': 'P012', 'address': 'Boston, MA'},
            {'name': 'Pragmatic Bookshelf', 'code': 'P013', 'address': 'Raleigh, NC'},
            {'name': 'No Starch Press', 'code': 'P014', 'address': 'San Francisco, CA'},
            {'name': 'Apress', 'code': 'P015', 'address': 'New York, NY'},
        ]

        publishers = []
        for data in publishers_data:
            publisher, _ = BookPublisher.objects.get_or_create(
                code=data['code'],
                defaults={
                    'name': data['name'],
                    'address': data['address'],
                    'contact': self.fake.name(),
                    'phone': self.fake.phone_number(),
                    'email': self.fake.email(),
                    'website': self.fake.url(),
                }
            )
            publishers.append(publisher)

        return publishers

    def _generate_authors(self):
        """生成作者"""
        # 技术专家
        authors_data = [
            # 国内作者
            {'name': '廖雪峰', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '李运华', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '王争', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '张孝祥', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '周志明', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '杨开振', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '秦小波', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '池建强', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '阮一峰', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '张小龙', 'pen_name': None, 'gender': 1, 'country': '中国'},
            {'name': '陈皓', 'pen_name': '左耳朵耗子', 'gender': 1, 'country': '中国'},
            {'name': '耗子叔', 'pen_name': 'CoolShell', 'gender': 1, 'country': '中国'},

            # 国外作者
            {'name': 'Martin Fowler', 'pen_name': None, 'gender': 1, 'country': '美国'},
            {'name': 'Robert C. Martin', 'pen_name': 'Uncle Bob', 'gender': 1, 'country': '美国'},
            {'name': 'Kent Beck', 'pen_name': None, 'gender': 1, 'country': '美国'},
            {'name': 'Andrew Hunt', 'pen_name': None, 'gender': 1, 'country': '美国'},
            {'name': 'David Thomas', 'pen_name': None, 'gender': 1, 'country': '美国'},
            {'name': 'Guido van Rossum', 'pen_name': None, 'gender': 1, 'country': '荷兰'},
            {'name': 'James Gosling', 'pen_name': None, 'gender': 1, 'country': '加拿大'},
            {'name': 'Brendan Eich', 'pen_name': None, 'gender': 1, 'country': '美国'},
            {'name': 'Linus Torvalds', 'pen_name': None, 'gender': 1, 'country': '芬兰'},
            {'name': 'Ken Thompson', 'pen_name': None, 'gender': 1, 'country': '美国'},
            {'name': 'Rob Pike', 'pen_name': None, 'gender': 1, 'country': '美国'},
        ]

        authors = []
        for data in authors_data:
            author, _ = BookAuthor.objects.get_or_create(
                name=data['name'],
                defaults={
                    'pen_name': data['pen_name'],
                    'gender': data['gender'],
                    'country': data['country'],
                    'biography': self.fake.text(max_nb_chars=200),
                }
            )
            authors.append(author)

        # 生成额外的随机作者
        for i in range(10):
            name = self.fake.name()
            author, _ = BookAuthor.objects.get_or_create(
                name=name,
                defaults={
                    'gender': random.choice([1, 2]),
                    'country': random.choice(['中国', '美国', '英国']),
                    'biography': self.fake.text(max_nb_chars=200),
                }
            )
            authors.append(author)

        return authors

    def _generate_books(self, count, categories, publishers, authors):
        """生成图书"""
        # 图书标题模板
        title_templates = [
            '{category}从入门到精通',
            '{category}实战',
            '{category}核心技术与最佳实践',
            '{category}设计与实现',
            '{category}高级编程',
            '深入理解{category}',
            '{category}权威指南',
            '{category}编程思想',
            '{category}性能优化',
            '{category}微服务架构',
        ]

        books = []
        used_isbns = set()

        for i in range(count):
            # 随机选择分类
            category = random.choice(categories)

            # 生成标题
            title = random.choice(title_templates).format(category=category.name)
            if random.random() > 0.7:  # 30%概率添加副标题
                title += f': {self.fake.sentence(nb_words=6)[:-1]}'

            # 生成唯一ISBN
            while True:
                isbn = self._generate_isbn()
                if isbn not in used_isbns:
                    used_isbns.add(isbn)
                    break

            # 生成出版日期（近5年内）
            publish_date = self.fake.date_between(start_date='-5y', end_date='today')

            # 生成价格
            price = round(random.uniform(39.90, 199.00), 2)

            # 生成库存
            total_quantity = random.randint(3, 20)
            available_ratio = random.uniform(0.3, 1.0)
            available_quantity = int(total_quantity * available_ratio)

            # 选择作者（1-3个）
            book_authors = random.sample(authors, random.randint(1, 3))

            # 创建图书对象
            book = Book(
                isbn=isbn,
                title=title,
                subtitle=random.choice([None, self.fake.sentence(nb_words=8)[:-1]]),
                category=category,
                publisher=random.choice(publishers),
                publish_date=publish_date,
                edition=random.choice(['第1版', '第2版', '第3版', '第4版']),
                pages=random.randint(200, 800),
                format=random.choice(['16开', '32开', '大32开']),
                packaging=random.choice(['平装', '精装']),
                total_quantity=total_quantity,
                available_quantity=available_quantity,
                location=f'A区-{random.randint(1, 5)}层-{random.randint(1, 20)}架',
                price=price,
                language=random.choice(['中文', '英文', '中英双语']),
                summary=self.fake.text(max_nb_chars=300),
                tags=','.join(random.sample([
                    '编程', '技术', '畅销', '推荐', '经典', '入门',
                    '进阶', '实战', '教程', '指南'
                ], random.randint(2, 5))),
                status=random.choices([0, 1, 2, 3], weights=[85, 10, 3, 2])[0],
            )
            book.save()
            book.authors.set(book_authors)
            books.append(book)

        return books

    def _generate_isbn(self):
        """生成ISBN编号"""
        # 中国: 978-7-xxxx-x, 美国: 978-1-xxxx-x
        prefix = random.choice(['978-7-', '978-1-'])
        random_part = ''.join([str(random.randint(0, 9)) for _ in range(10)])
        return prefix + random_part
