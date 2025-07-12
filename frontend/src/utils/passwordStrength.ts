/*
 * @Author: XItools Team
 * @Date: 2025-07-01 11:00:00
 * @LastEditors: XItools Team
 * @LastEditTime: 2025-07-01 11:00:00
 * @FilePath: \XItools\frontend\src\utils\passwordStrength.ts
 * @Description: 密码强度检查工具函数
 *
 * Copyright (c) 2025 by XItools Team, All Rights Reserved.
 */

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
  requirements: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

/**
 * 检查密码强度
 * @param password 密码字符串
 * @returns 密码强度结果
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    length: password.length >= 6, // 降低最小长度要求
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // 计算满足的要求数量
  const satisfiedCount = Object.values(requirements).filter(Boolean).length;

  // 计算基础分数 - 更宽松的评分
  let score = 0;

  // 长度分数 (0-50分) - 提高长度权重
  if (password.length >= 6) score += 30; // 6位就给30分
  if (password.length >= 8) score += 10; // 8位再给10分
  if (password.length >= 12) score += 10; // 12位再给10分

  // 字符类型分数 (0-40分) - 降低字符类型要求
  if (requirements.lowercase) score += 10;
  if (requirements.uppercase) score += 10;
  if (requirements.number) score += 10;
  if (requirements.special) score += 10;

  // 复杂度奖励 (0-10分) - 降低复杂度要求
  if (satisfiedCount >= 2) score += 5; // 满足2种类型就给奖励
  if (satisfiedCount >= 3) score += 5; // 满足3种类型再给奖励

  // 确保分数在0-100范围内
  score = Math.min(100, Math.max(0, score));

  // 确定强度等级 - 更宽松的标准
  let strength: PasswordStrength;
  if (score < 30) {
    // 降低弱密码阈值
    strength = 'weak';
  } else if (score < 60) {
    // 降低中等密码阈值
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  // 生成反馈建议 - 更宽松的建议
  const feedback: string[] = [];

  if (!requirements.length) {
    feedback.push('密码至少需要6个字符');
  }

  // 只在密码很弱时才建议添加字符类型
  if (score < 30) {
    if (!requirements.lowercase && !requirements.uppercase) {
      feedback.push('建议添加字母');
    }
    if (!requirements.number) {
      feedback.push('建议添加数字');
    }
  }

  // 额外建议 - 降低建议标准
  if (password.length < 8) {
    feedback.push('建议使用8个字符以上的密码');
  }

  // 检查常见弱密码模式
  const commonPatterns = [
    /^(.)\1+$/, // 重复字符
    /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // 连续字符
    /^(password|123456|qwerty|admin|root|user|guest)/i, // 常见密码
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('避免使用常见的密码模式');
      score = Math.max(0, score - 20);
      break;
    }
  }

  // 重新评估强度（考虑模式检查后的分数）
  if (score < 40) {
    strength = 'weak';
  } else if (score < 70) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    strength,
    score,
    feedback,
    requirements,
  };
}

/**
 * 获取密码强度的颜色
 * @param strength 密码强度
 * @returns CSS颜色值
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return 'rgb(var(--color-error))';
    case 'medium':
      return 'rgb(var(--color-warning))';
    case 'strong':
      return 'rgb(var(--color-success))';
    default:
      return 'rgb(var(--color-text-secondary))';
  }
}

/**
 * 获取密码强度的文本描述
 * @param strength 密码强度
 * @returns 强度描述
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak':
      return '弱';
    case 'medium':
      return '中等';
    case 'strong':
      return '强';
    default:
      return '';
  }
}

/**
 * 生成安全的随机密码
 * @param length 密码长度 (默认12)
 * @param includeSpecial 是否包含特殊字符 (默认true)
 * @returns 生成的密码
 */
export function generateSecurePassword(
  length: number = 12,
  includeSpecial: boolean = true,
): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let charset = lowercase + uppercase + numbers;
  if (includeSpecial) {
    charset += special;
  }

  let password = '';

  // 确保至少包含每种类型的字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  if (includeSpecial) {
    password += special[Math.floor(Math.random() * special.length)];
  }

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // 打乱字符顺序
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
