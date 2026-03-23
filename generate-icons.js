// 生成 PWA 图标
// 在浏览器控制台运行此代码生成图标

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

sizes.forEach(size => {
  canvas.width = size;
  canvas.height = size;
  
  // 背景 - 渐变绿色
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#1a9e6e');
  gradient.addColorStop(1, '#0e7a52');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // 圆角
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  // 重新绘制背景（因为 destination-in 会裁剪）
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.clip();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
  
  // 鱼图标
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐟', size / 2, size / 2);
  
  // 下载链接
  const link = document.createElement('a');
  link.download = `icon-${size}x${size}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

console.log('Icons generated!');
