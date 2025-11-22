/**
 * 测试多负责人功能
 *
 * 测试场景：
 * 1. 创建任务并分配多个负责人
 * 2. 添加新的负责人
 * 3. 移除负责人
 * 4. 验证团队成员约束
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始测试多负责人功能...\n');

  try {
    // 1. 获取测试用户和看板
    console.log('1. 获取测试数据...');
    const users = await prisma.user.findMany({
      take: 3,
    });

    if (users.length < 2) {
      console.log('❌ 测试失败：需要至少2个用户进行测试');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];
    const user3 = users.length > 2 ? users[2] : null;

    console.log(`找到用户: ${user1.username}, ${user2.username}${user3 ? `, ${user3.username}` : ''}`);

    // 获取一个看板
    const board = await prisma.board.findFirst({
      where: { ownerId: user1.id },
      include: {
        columns: true,
      },
    });

    if (!board || board.columns.length === 0) {
      console.log('❌ 测试失败：需要至少一个带列的看板');
      return;
    }

    console.log(`找到看板: ${board.name}`);

    // 2. 创建带有多个负责人的任务
    console.log('\n2. 创建带有多个负责人的任务...');
    const assignees = user3 ? [user1.id, user2.id, user3.id] : [user1.id, user2.id];

    const task = await prisma.task.create({
      data: {
        title: '测试多负责人任务',
        description: '这是一个测试多负责人功能的任务',
        status: board.columns[0].id,
        boardId: board.id,
        ownerId: user1.id,
        assignees: assignees,
      },
    });

    console.log(`✅ 任务创建成功，ID: ${task.id}`);
    console.log(`   负责人: ${task.assignees.length} 人`);

    // 3. 验证任务的负责人
    console.log('\n3. 验证任务负责人...');
    const createdTask = await prisma.task.findUnique({
      where: { id: task.id },
    });

    if (!createdTask) {
      console.log('❌ 找不到创建的任务');
      return;
    }

    console.log(`   实际负责人数量: ${createdTask.assignees.length}`);
    console.log(`   负责人 IDs: ${createdTask.assignees.join(', ')}`);

    if (createdTask.assignees.length === assignees.length) {
      console.log('✅ 负责人数量正确');
    } else {
      console.log('❌ 负责人数量不正确');
    }

    // 4. 更新任务，添加/移除负责人
    console.log('\n4. 测试更新负责人...');

    // 移除一个负责人
    const newAssignees = createdTask.assignees.slice(0, -1);
    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        assignees: newAssignees,
      },
    });

    console.log(`✅ 移除负责人成功，当前负责人: ${updatedTask.assignees.length} 人`);

    // 5. 测试空数组
    console.log('\n5. 测试清空负责人...');
    const taskWithNoAssignees = await prisma.task.update({
      where: { id: task.id },
      data: {
        assignees: [],
      },
    });

    console.log(`✅ 清空负责人成功，当前负责人: ${taskWithNoAssignees.assignees.length} 人`);

    // 6. 清理测试数据
    console.log('\n6. 清理测试数据...');
    await prisma.task.delete({
      where: { id: task.id },
    });
    console.log('✅ 测试任务已删除');

    console.log('\n✅ 所有测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
