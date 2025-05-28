const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 创建.env文件
const envContent = `# 服务器配置
PORT=3000
HOST=0.0.0.0

# 数据库配置
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xitools"

# CORS配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
`;

try {
  fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
  console.log('✅ 创建 .env 文件成功');
} catch (error) {
  console.error('❌ 创建 .env 文件失败:', error.message);
}

// 确保所有必要的目录存在
const directories = [
  '../src/controllers',
  '../src/routes',
  '../src/services',
  '../src/utils',
  '../src/types',
  '../src/config'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ 创建目录 ${dir} 成功`);
  }
});

// 安装依赖
console.log('⏳ 安装依赖中...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ 依赖安装成功');
} catch (error) {
  console.error('❌ 依赖安装失败:', error.message);
}

// 生成Prisma客户端
console.log('⏳ 生成Prisma客户端...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Prisma客户端生成成功');
} catch (error) {
  console.error('❌ Prisma客户端生成失败:', error.message);
}

console.log('\n🎉 初始化完成! 接下来请：');
console.log('1. 启动PostgreSQL数据库: docker compose up -d');
console.log('2. 创建数据库迁移: npm run prisma:migrate:dev');
console.log('3. 启动开发服务器: npm run dev'); 