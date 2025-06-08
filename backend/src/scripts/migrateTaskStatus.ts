import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

/**
 * 数据迁移脚本：将任务的status字段从旧的字符串值迁移到新的列UUID
 */
async function migrateTaskStatus() {
  console.log('开始迁移任务状态数据...');

  try {
    // 1. 获取所有列
    const columns = await prisma.boardColumn.findMany({
      orderBy: { order: 'asc' }
    });

    console.log('找到列:', columns.map(col => `${col.name} (${col.id})`));

    // 2. 创建状态映射
    const statusMapping: Record<string, string> = {};
    
    // 根据列名创建映射
    for (const column of columns) {
      switch (column.name) {
        case '待办':
          statusMapping['todo'] = column.id;
          statusMapping['To Do'] = column.id;
          statusMapping['待办'] = column.id;
          break;
        case '进行中':
          statusMapping['in-progress'] = column.id;
          statusMapping['In Progress'] = column.id;
          statusMapping['进行中'] = column.id;
          break;
        case '已完成':
          statusMapping['done'] = column.id;
          statusMapping['Done'] = column.id;
          statusMapping['已完成'] = column.id;
          break;
      }
    }

    console.log('状态映射:', statusMapping);

    // 3. 获取所有需要迁移的任务
    const tasks = await prisma.task.findMany();
    console.log(`找到 ${tasks.length} 个任务需要检查`);

    let migratedCount = 0;

    // 4. 更新任务状态
    for (const task of tasks) {
      const newStatus = statusMapping[task.status];
      
      if (newStatus && newStatus !== task.status) {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: newStatus }
        });
        
        console.log(`任务 "${task.title}" 状态从 "${task.status}" 更新为 "${newStatus}"`);
        migratedCount++;
      } else if (!newStatus) {
        console.warn(`任务 "${task.title}" 的状态 "${task.status}" 没有找到对应的列`);
      }
    }

    console.log(`迁移完成！共更新了 ${migratedCount} 个任务的状态`);

    // 5. 验证迁移结果
    const updatedTasks = await prisma.task.findMany({
      select: { id: true, title: true, status: true }
    });

    console.log('\n迁移后的任务状态:');
    for (const task of updatedTasks) {
      const column = columns.find(col => col.id === task.status);
      console.log(`- ${task.title}: ${task.status} (${column?.name || '未知列'})`);
    }

  } catch (error) {
    console.error('迁移失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateTaskStatus()
    .then(() => {
      console.log('数据迁移成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('数据迁移失败:', error);
      process.exit(1);
    });
}

export { migrateTaskStatus };
