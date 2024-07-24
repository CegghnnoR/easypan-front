export default {
  size2Str: (limit) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitSize = 1024;
    
    let i = 0;
    while (limit >= unitSize && i < units.length - 1) {
      limit /= unitSize;
      i++;
    }
    
    const size = limit.toFixed(2);
    const formattedSize = parseFloat(size).toString(); // 移除不必要的小数点和零
    
    return formattedSize + units[i];
  }
}