#!/usr/bin/env node

/**
 * XItools MCP客户端代理
 * 功能：将stdio MCP请求转发到xitools.furdow.com的HTTP MCP服务
 * 作者：Furdow
 */

const readline = require('readline');

// XItools远程MCP服务器配置
const MCP_SERVER_URL = 'http://xitools.furdow.com/mcp';
const TIMEOUT = 30000; // 30秒超时

// 创建stdio接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// 日志函数（输出到stderr，避免干扰stdio通信）
function log(message) {
  console.error(`[XItools-MCP] ${new Date().toISOString()} - ${message}`);
}

// HTTP请求函数
async function makeHttpRequest(data) {
  try {
    // 使用Node.js内置的https/http模块
    const https = require('https');
    const http = require('http');
    const url = require('url');

    const parsedUrl = new URL(MCP_SERVER_URL);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify(data);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'XItools-MCP-Client/1.0.0',
        'Cache-Control': 'no-cache',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: TIMEOUT
    };

    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              throw new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
            }

            const result = JSON.parse(responseData);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });

  } catch (error) {
    log(`HTTP请求失败: ${error.message}`);

    // 返回MCP错误响应
    return {
      jsonrpc: "2.0",
      id: data.id || null,
      error: {
        code: -32603,
        message: "Internal error",
        data: {
          details: `无法连接到XItools服务器: ${error.message}`,
          server_url: MCP_SERVER_URL
        }
      }
    };
  }
}

// 处理stdin输入
rl.on('line', async (line) => {
  try {
    // 解析JSON-RPC请求
    const request = JSON.parse(line.trim());
    
    log(`收到请求: ${request.method || 'unknown'} (id: ${request.id || 'none'})`);
    
    // 转发到远程服务器
    const response = await makeHttpRequest(request);
    
    // 输出响应到stdout
    console.log(JSON.stringify(response));
    
    log(`响应已发送 (id: ${response.id || 'none'})`);
    
  } catch (error) {
    log(`处理请求失败: ${error.message}`);
    
    // 发送错误响应
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error",
        data: {
          details: error.message
        }
      }
    };
    
    console.log(JSON.stringify(errorResponse));
  }
});

// 处理进程退出
process.on('SIGINT', () => {
  log('收到SIGINT信号，正在退出...');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('收到SIGTERM信号，正在退出...');
  rl.close();
  process.exit(0);
});

// 启动日志
log(`XItools MCP客户端已启动`);
log(`远程服务器: ${MCP_SERVER_URL}`);
log(`等待MCP请求...`);
