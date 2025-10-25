/**
 * 邮件服务 - 使用 Resend 发送邮件
 *
 * Resend官网: https://resend.com
 * 文档: https://resend.com/docs/send-with-nodejs
 */

import { Resend } from 'resend';

interface PasswordResetEmailPayload {
  to: string;
  username: string;
  code: string;
  expiresAt: Date;
}

/**
 * 初始化 Resend 客户端
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 获取发件人地址（从环境变量或使用默认值）
 */
function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'XItools <onboarding@resend.dev>';
}

/**
 * 发送密码重置验证码邮件
 */
export async function sendPasswordResetCodeEmail({
  to,
  username,
  code,
  expiresAt
}: PasswordResetEmailPayload): Promise<void> {
  // 检查是否配置了 Resend API Key
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EmailService] 未配置 RESEND_API_KEY，邮件发送已跳过');
    console.info(`[EmailService][DEV] 密码重置验证码: ${code} (用户: ${username}, 邮箱: ${to})`);
    return;
  }

  try {
    const expiresLabel = formatExpiryTime(expiresAt);

    // 发送邮件
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [to],
      subject: 'XItools - 密码重置验证码',
      html: generatePasswordResetEmailHTML(username, code, expiresLabel),
    });

    if (error) {
      console.error('[EmailService] 邮件发送失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }

    console.info(`[EmailService] 密码重置邮件已发送 | 收件人: ${to} | 邮件ID: ${data?.id}`);
  } catch (error) {
    console.error('[EmailService] 邮件发送异常:', error);
    throw error;
  }
}

/**
 * 格式化过期时间
 */
function formatExpiryTime(expiresAt: Date): string {
  const now = new Date();
  const diffMinutes = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));

  if (diffMinutes > 0) {
    return `${diffMinutes} 分钟`;
  }
  return '已过期';
}

/**
 * 生成密码重置邮件的HTML内容
 */
function generatePasswordResetEmailHTML(username: string, code: string, expiryLabel: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>密码重置验证码</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      color: #111;
      margin-bottom: 20px;
    }
    .greeting {
      font-size: 16px;
      color: #666;
      margin-bottom: 20px;
    }
    .code-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-bottom: 10px;
    }
    .code {
      font-size: 36px;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .expiry {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin-top: 15px;
    }
    .info {
      background-color: #f8f9fa;
      border-left: 4px solid #4F46E5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-title {
      font-weight: bold;
      color: #4F46E5;
      margin-bottom: 10px;
    }
    .info-text {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid: #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-text {
      font-size: 14px;
      color: #856404;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">XItools</div>
      <div class="title">密码重置验证码</div>
    </div>

    <div class="greeting">
      你好，<strong>${username}</strong>！
    </div>

    <p>我们收到了你的密码重置请求。请使用以下验证码完成密码重置：</p>

    <div class="code-box">
      <div class="code-label">你的验证码</div>
      <div class="code">${code}</div>
      <div class="expiry">有效期：${expiryLabel}</div>
    </div>

    <div class="info">
      <div class="info-title">📋 使用说明</div>
      <div class="info-text">1. 在密码重置页面输入上方 6 位验证码</div>
      <div class="info-text">2. 设置你的新密码</div>
      <div class="info-text">3. 验证码有效期为 ${expiryLabel}</div>
    </div>

    <div class="warning">
      <div class="warning-text">
        ⚠️ <strong>安全提示：</strong>如果你没有请求重置密码，请忽略此邮件。为了保护你的账户安全，请勿将验证码分享给任何人。
      </div>
    </div>

    <div class="footer">
      <p>这是一封自动发送的邮件，请勿直接回复。</p>
      <p>© 2025 XItools. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
