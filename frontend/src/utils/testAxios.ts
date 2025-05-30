import axios from 'axios';

export const testAxios = async () => {
  try {
    console.log('测试axios导入是否正常工作');
    
    // 测试一个简单的GET请求到一个公共API
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      console.log('Axios GET请求成功:', response.data);
    } catch (error) {
      console.error('Axios GET请求失败:', error);
    }
    
    return true;
  } catch (error) {
    console.error('测试axios失败:', error);
    return false;
  }
};

export default testAxios; 