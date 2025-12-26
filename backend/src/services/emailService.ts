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

interface RegisterVerificationEmailPayload {
  to: string;
  code: string;
  expiresAt: Date;
}

interface TeamInvitationEmailPayload {
  to: string;
  teamName: string;
  teamDescription?: string;
  inviterName: string;
  inviteLink: string;
  expiresAt: Date;
}

interface InvitationAcceptedEmailPayload {
  to: string;
  teamName: string;
  memberName: string;
  memberEmail: string;
}

/**
 * 初始化 Resend 客户端（延迟初始化）
 * 只在配置了 API Key 的情况下才创建实例
 */
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

/**
 * 获取发件人地址（从环境变量或使用默认值）
 * 注意：Resend 要求发件人地址必须是已验证域名下的邮箱地址
 */
function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'XItools <noreply@xitools.furdow.com>';
}

/**
 * 发送注册验证码邮件
 */
export async function sendRegisterVerificationCodeEmail({
  to,
  code,
  expiresAt
}: RegisterVerificationEmailPayload): Promise<void> {
  // 获取 Resend 客户端
  const client = getResendClient();

  // 如果未配置 API Key，仅在控制台输出（开发环境）
  if (!client) {
    console.warn('[EmailService] 未配置 RESEND_API_KEY，邮件发送已跳过');
    console.info(`[EmailService][DEV] 注册验证码: ${code} (邮箱: ${to})`);
    return;
  }

  try {
    const expiresLabel = formatExpiryTime(expiresAt);

    // 发送邮件
    const { data, error } = await client.emails.send({
      from: getFromAddress(),
      to: [to],
      subject: 'XItools - 注册验证码',
      html: generateRegisterVerificationEmailHTML(code, expiresLabel),
    });

    if (error) {
      console.error('[EmailService] 邮件发送失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }

    console.info(`[EmailService] 注册验证码邮件已发送 | 收件人: ${to} | 邮件ID: ${data?.id}`);
  } catch (error) {
    console.error('[EmailService] 邮件发送异常:', error);
    throw error;
  }
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
  // 获取 Resend 客户端
  const client = getResendClient();

  // 如果未配置 API Key，仅在控制台输出（开发环境）
  if (!client) {
    console.warn('[EmailService] 未配置 RESEND_API_KEY，邮件发送已跳过');
    console.info(`[EmailService][DEV] 密码重置验证码: ${code} (用户: ${username}, 邮箱: ${to})`);
    return;
  }

  try {
    const expiresLabel = formatExpiryTime(expiresAt);

    // 发送邮件
    const { data, error } = await client.emails.send({
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
 * 生成注册验证码邮件的HTML内容
 */
function generateRegisterVerificationEmailHTML(code: string, expiryLabel: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注册验证码</title>
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
      border-left: 4px solid #ffc107;
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
      <div class="title">欢迎注册 XItools</div>
    </div>

    <div class="greeting">
      感谢您选择 XItools！
    </div>

    <p>为了确保账户安全，请使用以下验证码完成注册：</p>

    <div class="code-box">
      <div class="code-label">你的验证码</div>
      <div class="code">${code}</div>
      <div class="expiry">有效期：${expiryLabel}</div>
    </div>

    <div class="info">
      <div class="info-title">📋 使用说明</div>
      <div class="info-text">1. 在注册页面输入上方 6 位验证码</div>
      <div class="info-text">2. 完成账户信息填写</div>
      <div class="info-text">3. 验证码有效期为 ${expiryLabel}</div>
    </div>

    <div class="warning">
      <div class="warning-text">
        ⚠️ <strong>安全提示：</strong>如果你没有尝试注册 XItools 账户，请忽略此邮件。为了保护账户安全，请勿将验证码分享给任何人。
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

/**
 * 发送团队邀请邮件
 */
export async function sendTeamInvitationEmail({
  to,
  teamName,
  teamDescription,
  inviterName,
  inviteLink,
  expiresAt
}: TeamInvitationEmailPayload): Promise<void> {
  const client = getResendClient();

  if (!client) {
    console.warn('[EmailService] 未配置 RESEND_API_KEY，邮件发送已跳过');
    console.info(`[EmailService][DEV] 团队邀请链接: ${inviteLink} (邮箱: ${to}, 团队: ${teamName})`);
    return;
  }

  try {
    const expiresLabel = formatExpiryTime(expiresAt);

    const { data, error } = await client.emails.send({
      from: getFromAddress(),
      to: [to],
      subject: `${inviterName} 邀请你加入 ${teamName} 团队 - XItools`,
      html: generateTeamInvitationEmailHTML(
        teamName,
        teamDescription,
        inviterName,
        inviteLink,
        expiresLabel
      ),
    });

    if (error) {
      console.error('[EmailService] 团队邀请邮件发送失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }

    console.info(`[EmailService] 团队邀请邮件已发送 | 收件人: ${to} | 团队: ${teamName} | 邮件ID: ${data?.id}`);
  } catch (error) {
    console.error('[EmailService] 团队邀请邮件发送异常:', error);
    throw error;
  }
}

/**
 * 发送邀请接受通知邮件（给团队管理员）
 */
export async function sendInvitationAcceptedEmail({
  to,
  teamName,
  memberName,
  memberEmail
}: InvitationAcceptedEmailPayload): Promise<void> {
  const client = getResendClient();

  if (!client) {
    console.warn('[EmailService] 未配置 RESEND_API_KEY，邮件发送已跳过');
    console.info(`[EmailService][DEV] 新成员加入: ${memberName} (${memberEmail}) 加入团队 ${teamName}`);
    return;
  }

  try {
    const { data, error } = await client.emails.send({
      from: getFromAddress(),
      to: [to],
      subject: `${memberName} 已加入你的团队 - XItools`,
      html: generateInvitationAcceptedEmailHTML(teamName, memberName, memberEmail),
    });

    if (error) {
      console.error('[EmailService] 邀请接受通知邮件发送失败:', error);
      throw new Error(`邮件发送失败: ${error.message}`);
    }

    console.info(`[EmailService] 邀请接受通知邮件已发送 | 收件人: ${to} | 新成员: ${memberName} | 邮件ID: ${data?.id}`);
  } catch (error) {
    console.error('[EmailService] 邀请接受通知邮件发送异常:', error);
    throw error;
  }
}

/**
 * 生成团队邀请邮件的HTML内容
 */
function generateTeamInvitationEmailHTML(
  teamName: string,
  teamDescription: string | undefined,
  inviterName: string,
  inviteLink: string,
  expiryLabel: string
): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>团队邀请</title>
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
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 16px;
      color: #666;
    }
    .team-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 30px;
      margin: 30px 0;
      color: white;
    }
    .team-name {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    }
    .team-description {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      margin-top: 10px;
    }
    .inviter-info {
      background-color: #f8f9fa;
      border-left: 4px solid #4F46E5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .inviter-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .inviter-name {
      font-size: 18px;
      font-weight: bold;
      color: #4F46E5;
    }
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);
    }
    .info {
      background-color: #f8f9fa;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .info-text {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }
    .expiry-notice {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .expiry-text {
      font-size: 14px;
      color: #856404;
    }
    .link-container {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      word-break: break-all;
    }
    .link-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    .link {
      color: #4F46E5;
      font-size: 14px;
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
      <div class="title">🎉 你收到了团队邀请</div>
      <div class="subtitle">开启高效团队协作之旅</div>
    </div>

    <div class="inviter-info">
      <div class="inviter-label">邀请者</div>
      <div class="inviter-name">${inviterName}</div>
    </div>

    <p>你好！</p>
    <p><strong>${inviterName}</strong> 邀请你加入以下团队：</p>

    <div class="team-info">
      <div class="team-name">${teamName}</div>
      ${teamDescription ? `<div class="team-description">${teamDescription}</div>` : ''}
    </div>

    <div class="cta-container">
      <a href="${inviteLink}" class="cta-button">接受邀请，加入团队</a>
    </div>

    <div class="info">
      <div class="info-text">✨ 加入团队后，你可以：</div>
      <div class="info-text">• 与团队成员协作管理项目和任务</div>
      <div class="info-text">• 实时查看团队工作进度</div>
      <div class="info-text">• 参与任务讨论和评论</div>
      <div class="info-text">• 共享团队知识和资源</div>
    </div>

    <div class="expiry-notice">
      <div class="expiry-text">
        ⏰ <strong>提醒：</strong>此邀请将在 ${expiryLabel} 后过期，请尽快接受邀请。
      </div>
    </div>

    <div class="link-container">
      <div class="link-label">如果按钮无法点击，请复制以下链接到浏览器：</div>
      <a href="${inviteLink}" class="link">${inviteLink}</a>
    </div>

    <div class="footer">
      <p>如果你不想加入此团队，可以忽略此邮件。</p>
      <p>这是一封自动发送的邮件，请勿直接回复。</p>
      <p>© 2025 XItools. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 生成邀请接受通知邮件的HTML内容
 */
function generateInvitationAcceptedEmailHTML(
  teamName: string,
  memberName: string,
  memberEmail: string
): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新成员加入团队</title>
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
      margin-bottom: 10px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .member-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
      color: white;
      text-align: center;
    }
    .member-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .member-email {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }
    .team-name {
      background-color: #f8f9fa;
      border-left: 4px solid #4F46E5;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .team-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .team-value {
      font-size: 18px;
      font-weight: bold;
      color: #4F46E5;
    }
    .info {
      background-color: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-text {
      font-size: 14px;
      color: #0c5a9c;
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
      <div class="icon">👥</div>
      <div class="title">团队有新成员加入</div>
    </div>

    <p>你好！</p>
    <p>好消息！你的团队迎来了新成员：</p>

    <div class="member-card">
      <div class="member-name">${memberName}</div>
      <div class="member-email">${memberEmail}</div>
    </div>

    <div class="team-name">
      <div class="team-label">团队名称</div>
      <div class="team-value">${teamName}</div>
    </div>

    <div class="info">
      <div class="info-text">
        💡 <strong>提示：</strong>你可以在团队设置中为新成员分配项目权限，让团队协作更加高效。
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
