/**
 * API密钥创建成功显示组件
 *
 * 显示新创建的API密钥完整信息，提供复制和配置示例
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import useToast from '../ui/Toast/useToast';

interface ApiKeySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  keyName: string;
}

export const ApiKeySuccessModal: React.FC<ApiKeySuccessModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  keyName,
}) => {
  const { t } = useTranslation();
  const [, toastAPI] = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedExample, setSelectedExample] = useState<'cursor' | 'augment' | 'claude'>('cursor');

  // 复制API密钥
  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toastAPI.success('API密钥已复制到剪贴板');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toastAPI.error('复制失败');
    }
  };

  // 复制配置示例
  const copyExample = async (example: string) => {
    try {
      await navigator.clipboard.writeText(example);
      toastAPI.success('示例代码已复制到剪贴板');
    } catch (error) {
      toastAPI.error('复制失败');
    }
  };

  // 使用示例代码
  // 配置示例（与 README 保持一致，动态注入 apiKey）
  const examples: Record<'cursor' | 'augment' | 'claude', string> = {
    cursor: `{
  "mcpServers": {
    "xitools": {
      "type": "streamable-http",
      "url": "https://xitools.furdow.com/mcp-auth",
      "headers": { "Authorization": "Bearer ${apiKey}" }
    }
  }
}`,
    augment: `{
  "mcpServers": {
    "xitools": {
      "url": "https://xitools.furdow.com/mcp-auth?api_key=${apiKey}",
      "headers": { "Authorization": "Bearer ${apiKey}", "X-Api-Key": "${apiKey}" }
    }
  }
}`,
    claude: `{
  "mcpServers": {
    "xitools": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://xitools.furdow.com/mcp-auth",
        "--header",
        "Authorization: Bearer ${apiKey}"
      ]
    }
  }
}`,
  };
/*
  const examples = {
    curl: `# 获取看板列表
curl -X POST http://localhost:3000/api/mcp/get_boards \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"

# 创建任务
curl -X POST http://localhost:3000/api/mcp/create_task \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "boardId": "your-board-id",
    "title": "新任务",
    "description": "任务描述"
  }'`,

    javascript: `// 使用 fetch API
const API_KEY = '${apiKey}';
const BASE_URL = 'http://localhost:3000';

async function callMcpTool(toolName, params = {}) {
  const response = await fetch(\`\${BASE_URL}/api/mcp/\${toolName}\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  return await response.json();
}

// 获取看板列表
const boards = await callMcpTool('get_boards');

// 创建任务
const newTask = await callMcpTool('create_task', {
  boardId: 'your-board-id',
  title: '新任务',
  description: '任务描述'
});`,

    python: `import requests
import json

API_KEY = '${apiKey}'
BASE_URL = 'http://localhost:3000'

def call_mcp_tool(tool_name, params=None):
    """调用MCP工具"""
    url = f"{BASE_URL}/api/mcp/{tool_name}"
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    response = requests.post(url, headers=headers, json=params or {})
    return response.json()

# 获取看板列表
boards = call_mcp_tool('get_boards')

# 创建任务
new_task = call_mcp_tool('create_task', {
    'boardId': 'your-board-id',
    'title': '新任务',
    'description': '任务描述'
})`,
  };
  */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="API密钥创建成功"
      size="lg"
      className="api-key-success-modal"
    >
      <div className="success-content">
        {/* 成功提示 */}
        <div className="success-header">
          <div className="success-icon">
            <i className="icon-check-circle"></i>
          </div>
          <h3>API密钥创建成功！</h3>
          <p>您的API密钥 "{keyName}" 已成功创建</p>
        </div>

        {/* API密钥显示 */}
        <div className="api-key-display">
          <div className="key-section">
            <label className="section-label">您的API密钥</label>
            <div className="key-container">
              <code className="api-key-value">{apiKey}</code>
              <button
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyApiKey}
                title="复制API密钥"
              >
                <i className={`icon-${copied ? 'check' : 'copy'}`}></i>
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>

          {/* 重要提示 */}
          <div className="security-warning">
            <i className="icon-alert-triangle"></i>
            <div className="warning-content">
              <strong>重要：</strong>
              创建后可在密钥卡片点击“查看密钥”再次查看；请勿分享或提交到公共仓库。
            </div>
          </div>
        </div>

        {/* 配置示例（与README一致，支持Tab切换与复制） */}
        <div className="usage-examples">
          <div className="examples-header">
            <h4>配置示例</h4>
            <div className="example-tabs">
              {[
                { key: 'cursor', label: 'Cursor' },
                { key: 'augment', label: 'Augment' },
                { key: 'claude', label: 'Claude Desktop' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`tab-btn ${selectedExample === tab.key ? 'active' : ''}`}
                  onClick={() => setSelectedExample(tab.key as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="example-content">
            <div className="code-header">
              <span className="code-language">{selectedExample.toUpperCase()}</span>
              <button className="copy-code-btn" onClick={() => copyExample(examples[selectedExample])}>
                <i className="icon-copy"></i>
                复制代码
              </button>
            </div>
            <pre className="code-block scrollable">
              <code>{examples[selectedExample]}</code>
            </pre>
          </div>
        </div>


      </div>
    </Modal>
  );
};

export default ApiKeySuccessModal;
