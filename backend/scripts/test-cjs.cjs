/**
 * MCP工具测试脚本 (CommonJS版本)
 * 
 * 此脚本使用CommonJS模块格式，可能解决一些ES模块兼容性问题
 */

const http = require('http');

// MCP服务端点
const HOST = 'localhost';
const PORT = 3000;
const PATH = '/mcp';

// 生成随机ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 发送MCP请求
 */
function sendMcpRequest() {
  // 构建JSON-RPC请求
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: generateId(),
    method: 'get_task_schema',
    params: {}
  });

  // 请求选项
  const options = {
    hostname: HOST,
    port: PORT,
    path: PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Content-Length': data.length
    }
  };

  console.log('发送请求:', data);

  // 创建请求
  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let responseData = '';
    
    // 接收数据
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    // 完成接收
    res.on('end', () => {
      console.log('响应数据:');
      try {
        const parsedData = JSON.parse(responseData);
        console.log(JSON.stringify(parsedData, null, 2));
      } catch (e) {
        console.log(responseData);
      }
    });
  });

  // 处理错误
  req.on('error', (error) => {
    console.error('请求错误:', error);
  });

  // 发送请求数据
  req.write(data);
  req.end();
}

// 执行测试
console.log('===== 开始CommonJS测试 =====');
sendMcpRequest(); 