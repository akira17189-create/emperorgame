
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
console.log('检查文件:', filePath);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('文件大小:', content.length, '字节');

    // 检查基本的语法错误
    const lines = content.split('\n');

    // 检查括号匹配
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;

    console.log('大括号:', openBraces, '开', closeBraces, '闭', '差值', openBraces - closeBraces);
    console.log('小括号:', openParens, '开', closeParens, '闭', '差值', openParens - closeParens);
    console.log('方括号:', openBrackets, '开', closeBrackets, '闭', '差值', openBrackets - closeBrackets);

    if (openBraces === closeBraces && openParens === closeParens && openBrackets === closeBrackets) {
        console.log('✅ 括号匹配正确');
    } else {
        console.log('❌ 括号不匹配');
    }

    // 检查JSX标签
    const divOpen = (content.match(/<div/g) || []).length;
    const divClose = (content.match(/<\/div>/g) || []).length;
    const divSelfClose = (content.match(/<div[^>]*\/>/g) || []).length;

    console.log('JSX标签:');
    console.log('  <div 总数:', divOpen);
    console.log('  </div> 总数:', divClose);
    console.log('  自闭合标签:', divSelfClose);
    console.log('  实际开标签:', divOpen - divSelfClose);
    console.log('  实际闭标签:', divClose);

    if (divOpen - divSelfClose === divClose) {
        console.log('✅ JSX标签匹配正确');
    } else {
        console.log('❌ JSX标签不匹配');
    }

} catch (error) {
    console.error('检查失败:', error.message);
}
