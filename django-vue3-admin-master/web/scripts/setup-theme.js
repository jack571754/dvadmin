#!/usr/bin/env node

/**
 * DVAdmin 现代化主题集成脚本
 *
 * 用法:
 *   node scripts/setup-theme.js              # 交互式安装
 *   node scripts/setup-theme.js --force      # 强制覆盖
 *   node scripts/setup-theme.js --rollback   # 回滚
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
	themeDir: path.join(__dirname, '../src/theme'),
	backupDir: path.join(__dirname, '../.backups'),
	files: {
		indexScss: 'index.scss',
		indexBackup: 'index.scss.backup',
	},
	themes: {
		presets: 'presets.scss',
		modern: 'modern.scss',
		layout: 'layout-theme.scss',
	},
};

// 工具函数
const log = {
	info: (msg) => console.log('\x1b[36m%s\x1b[0m', `ℹ ${msg}`),
	success: (msg) => console.log('\x1b[32m%s\x1b[0m', `✓ ${msg}`),
	warn: (msg) => console.log('\x1b[33m%s\x1b[0m', `⚠ ${msg}`),
	error: (msg) => console.log('\x1b[31m%s\x1b[0m', `✗ ${msg}`),
};

// 检查文件是否存在
const fileExists = (filePath) => {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
};

// 创建备份
const createBackup = () => {
	const backupPath = path.join(CONFIG.backupDir, `index.scss.${Date.now()}`);

	// 确保备份目录存在
	if (!fs.existsSync(CONFIG.backupDir)) {
		fs.mkdirSync(CONFIG.backupDir, { recursive: true });
	}

	const sourcePath = path.join(CONFIG.themeDir, CONFIG.files.indexScss);

	if (!fileExists(sourcePath)) {
		log.error('找不到 index.scss 文件');
		return false;
	}

	try {
		fs.copyFileSync(sourcePath, backupPath);
		log.success(`已创建备份: ${path.basename(backupPath)}`);
		return backupPath;
	} catch (error) {
		log.error(`备份失败: ${error.message}`);
		return false;
	}
};

// 检查新样式文件是否存在
const checkThemeFiles = () => {
	const missingFiles = [];

	for (const [key, filename] of Object.entries(CONFIG.themes)) {
		const filePath = path.join(CONFIG.themeDir, filename);
		if (!fileExists(filePath)) {
			missingFiles.push(filename);
		}
	}

	if (missingFiles.length > 0) {
		log.error('缺少以下样式文件:');
		missingFiles.forEach((f) => console.log(`  - ${f}`));
		return false;
	}

	return true;
};

// 生成新的 index.scss 内容
const generateIndexContent = () => {
	return `/* ============================================
   DVAdmin 主题入口文件（现代化版本）
   ============================================ */

// ============================================
// 引入顺序很重要！请勿随意调整
// ============================================

// 1. 首先引入主题预设系统（包含所有 CSS 变量定义）
@use './presets.scss';

// 2. 引入现代化组件样式覆盖
@use './modern.scss';

// 3. 引入布局主题样式
@use './layout-theme.scss';

// ============================================
// 以下是原有样式保持不变
// ============================================
@use './app.scss';
@use './common/transition.scss';
@use './other.scss';
@use './element.scss';
@use './media/media.scss';
@use './waves.scss';
@use './dark.scss';
@use './fa/css/font-awesome.min.css';
`;
};

// 安装主题
const installTheme = (force = false) => {
	log.info('开始安装现代化主题...');

	// 检查样式文件
	if (!checkThemeFiles()) {
		log.error('请确保所有主题样式文件都已存在');
		process.exit(1);
	}

	// 创建备份
	const backupPath = createBackup();
	if (!backupPath) {
		process.exit(1);
	}

	// 生成新内容
	const newContent = generateIndexContent();
	const targetPath = path.join(CONFIG.themeDir, CONFIG.files.indexScss);

	// 检查是否已安装
	const currentContent = fs.readFileSync(targetPath, 'utf-8');
	if (currentContent.includes('presets.scss') && !force) {
		log.warn('检测到现代化主题已安装');
		log.info('如需重新安装，请使用 --force 参数');
		return;
	}

	// 写入新文件
	try {
		fs.writeFileSync(targetPath, newContent, 'utf-8');
		log.success('主题安装成功！');
		log.info(`备份文件: ${backupPath}`);
		log.info('请重启开发服务器查看效果');
	} catch (error) {
		log.error(`安装失败: ${error.message}`);
		log.info('正在恢复备份...');

		try {
			fs.copyFileSync(backupPath, targetPath);
			log.success('已恢复备份');
		} catch {
			log.error('恢复失败，请手动恢复备份');
		}
	}
};

// 回滚主题
const rollbackTheme = () => {
	log.info('正在回滚主题...');

	const backupFiles = fs.readdirSync(CONFIG.backupDir)
		.filter((f) => f.startsWith('index.scss.'))
		.sort()
		.reverse();

	if (backupFiles.length === 0) {
		log.error('没有找到备份文件');
		process.exit(1);
	}

	const latestBackup = path.join(CONFIG.backupDir, backupFiles[0]);
	const targetPath = path.join(CONFIG.themeDir, CONFIG.files.indexScss);

	try {
		fs.copyFileSync(latestBackup, targetPath);
		log.success('主题已回滚');
		log.info(`恢复自: ${backupFiles[0]}`);
	} catch (error) {
		log.error(`回滚失败: ${error.message}`);
	}
};

// 显示状态
const showStatus = () => {
	const targetPath = path.join(CONFIG.themeDir, CONFIG.files.indexScss);
	const content = fs.readFileSync(targetPath, 'utf-8');

	log.info('主题状态检查:');

	const hasModernTheme = content.includes('presets.scss');
	const hasBackup = fs.existsSync(CONFIG.backupDir);

	console.log('');
	console.log(`  现代化主题: ${hasModernTheme ? '\x1b[32m已安装\x1b[0m' : '\x1b[31m未安装\x1b[0m'}`);
	console.log(`  备份文件: ${hasBackup ? '\x1b[32m存在\x1b[0m' : '\x1b[31m不存在\x1b[0m'}`);

	if (hasBackup) {
		const backupFiles = fs.readdirSync(CONFIG.backupDir)
			.filter((f) => f.startsWith('index.scss.'));
		console.log(`  备份数量: ${backupFiles.length}`);
	}

	console.log('');
};

// CLI 参数处理
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
	case '--force':
		installTheme(true);
		break;

	case '--rollback':
		rollbackTheme();
		break;

	case '--status':
		showStatus();
		break;

	case '--help':
		console.log(`
DVAdmin 现代化主题集成脚本

用法:
  node scripts/setup-theme.js              # 交互式安装
  node scripts/setup-theme.js --force      # 强制覆盖安装
  node scripts/setup-theme.js --rollback   # 回滚到备份版本
  node scripts/setup-theme.js --status     # 查看当前状态
  node scripts/setup-theme.js --help       # 显示帮助信息
		`);
		break;

	default:
		// 交互式安装
		const readline = require('readline');
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(
			'是否要安装现代化主题？这会修改 index.scss 文件 (y/N): ',
			(answer) => {
				rl.close();
				if (answer.toLowerCase() === 'y') {
					installTheme();
				} else {
					log.info('已取消安装');
				}
			}
		);
		break;
}
