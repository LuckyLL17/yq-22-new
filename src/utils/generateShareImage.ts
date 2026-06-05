import QRCode from 'qrcode';
import { MatchResult, Person, SPICY_LABELS, PRICE_LABELS } from '@/types';

const CANVAS_WIDTH = 750;
const CANVAS_HEIGHT = 1200;
const PADDING = 40;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface ShareImageData {
  topResult: MatchResult;
  people: Person[];
  shareUrl: string;
  totalResults: number;
}

export async function generateShareImage(data: ShareImageData): Promise<string> {
  const { topResult, people, shareUrl, totalResults } = data;
  const { restaurant, matchScore, satisfiedPeople } = topResult;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#FFF7ED');
  gradient.addColorStop(0.5, '#FFFFFF');
  gradient.addColorStop(1, '#FEF3C7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#F97316';
  roundRect(ctx, PADDING, PADDING, CANVAS_WIDTH - PADDING * 2, 120, 24);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Poppins, Inter, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('🍽️ 吃饭匹配神器', PADDING + 32, PADDING + 60);

  ctx.font = '22px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('最佳匹配结果', CANVAS_WIDTH - PADDING - 32, PADDING + 60);
  ctx.textAlign = 'left';

  let y = PADDING + 120 + 32;
  const cardWidth = CANVAS_WIDTH - PADDING * 2;
  const cardHeight = 520;

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(249, 115, 22, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, PADDING, y, cardWidth, cardHeight, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  const imgHeight = 280;
  ctx.save();
  roundRect(ctx, PADDING + 24, y + 24, cardWidth - 48, imgHeight, 16);
  ctx.clip();
  
  try {
    const restaurantImg = await loadImage(restaurant.image);
    const imgRatio = restaurantImg.width / restaurantImg.height;
    const targetRatio = (cardWidth - 48) / imgHeight;
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgRatio > targetRatio) {
      drawHeight = imgHeight;
      drawWidth = drawHeight * imgRatio;
      drawX = PADDING + 24 + ((cardWidth - 48) - drawWidth) / 2;
      drawY = y + 24;
    } else {
      drawWidth = cardWidth - 48;
      drawHeight = drawWidth / imgRatio;
      drawX = PADDING + 24;
      drawY = y + 24 + (imgHeight - drawHeight) / 2;
    }
    ctx.drawImage(restaurantImg, drawX, drawY, drawWidth, drawHeight);
  } catch {
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(PADDING + 24, y + 24, cardWidth - 48, imgHeight);
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍜', CANVAS_WIDTH / 2, y + 24 + imgHeight / 2 + 30);
    ctx.textAlign = 'left';
  }
  ctx.restore();

  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 32px Poppins, Inter, sans-serif';
  ctx.fillText(restaurant.name, PADDING + 24, y + imgHeight + 60);

  const infoY = y + imgHeight + 100;
  ctx.fillStyle = '#6B7280';
  ctx.font = '24px Inter, sans-serif';
  
  const stars = '⭐'.repeat(Math.floor(restaurant.rating));
  ctx.fillText(`${stars} ${restaurant.rating}`, PADDING + 24, infoY);
  
  ctx.fillText(`• ${restaurant.cuisine}`, PADDING + 200, infoY);
  
  ctx.fillStyle = '#F97316';
  ctx.fillText(PRICE_LABELS[restaurant.priceLevel], PADDING + 380, infoY);
  
  ctx.fillStyle = '#3B82F6';
  ctx.fillText(`${restaurant.distance}km`, PADDING + 480, infoY);

  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(SPICY_LABELS[restaurant.spicyLevel], PADDING + 600, infoY);

  const scoreY = y + imgHeight + 150;
  const scoreSize = 100;
  const scoreX = CANVAS_WIDTH - PADDING - 24 - scoreSize;
  
  ctx.fillStyle = matchScore >= 80 ? '#10B981' : matchScore >= 60 ? '#F59E0B' : '#EF4444';
  ctx.beginPath();
  ctx.arc(scoreX + scoreSize / 2, scoreY + scoreSize / 2, scoreSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Poppins, Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${matchScore}`, scoreX + scoreSize / 2, scoreY + scoreSize / 2 + 6);
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText('匹配度', scoreX + scoreSize / 2, scoreY + scoreSize / 2 + 32);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#374151';
  ctx.font = '24px Inter, sans-serif';
  ctx.fillText(`👥 ${satisfiedPeople.length} 人满意`, PADDING + 24, scoreY + 35);

  const avatarY = scoreY + 75;
  ctx.fillStyle = '#6B7280';
  ctx.font = '20px Inter, sans-serif';
  ctx.fillText('参与人员：', PADDING + 24, avatarY + 20);
  
  let avatarX = PADDING + 140;
  people.slice(0, 6).forEach((person, i) => {
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.arc(avatarX + 18, avatarY + 18, 18, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(person.avatar, avatarX + 18, avatarY + 25);
    ctx.textAlign = 'left';
    
    avatarX += 42;
  });
  
  if (people.length > 6) {
    ctx.fillStyle = '#E5E7EB';
    ctx.beginPath();
    ctx.arc(avatarX + 18, avatarY + 18, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${people.length - 6}`, avatarX + 18, avatarY + 24);
    ctx.textAlign = 'left';
  }

  y += cardHeight + 32;

  const qrSectionY = y;
  const qrSectionHeight = 320;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(249, 115, 22, 0.1)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 2;
  roundRect(ctx, PADDING, qrSectionY, cardWidth, qrSectionHeight, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 26px Poppins, Inter, sans-serif';
  ctx.fillText('📱 扫码查看完整结果', PADDING + 32, qrSectionY + 50);
  
  ctx.fillStyle = '#6B7280';
  ctx.font = '20px Inter, sans-serif';
  ctx.fillText(`共找到 ${totalResults} 家适合你们的餐厅`, PADDING + 32, qrSectionY + 85);

  const qrSize = 200;
  const qrX = PADDING + 32;
  const qrY = qrSectionY + 100;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF',
      },
    });
    
    const qrImg = await loadImage(qrDataUrl);
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.error('QR code generation failed:', e);
  }

  ctx.fillStyle = '#374151';
  ctx.font = '20px Inter, sans-serif';
  ctx.fillText('微信扫一扫', qrX + qrSize + 40, qrY + 60);
  ctx.fillText('查看匹配结果', qrX + qrSize + 40, qrY + 95);
  
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText('或复制链接分享给好友', qrX + qrSize + 40, qrY + 140);

  ctx.fillStyle = '#F3F4F6';
  roundRect(ctx, qrX + qrSize + 40, qrY + 170, 320, 48, 8);
  ctx.fill();
  
  ctx.fillStyle = '#6B7280';
  ctx.font = '16px Inter, sans-serif';
  const displayUrl = shareUrl.length > 35 ? shareUrl.slice(0, 35) + '...' : shareUrl;
  ctx.fillText(displayUrl, qrX + qrSize + 56, qrY + 200);

  const footerY = CANVAS_HEIGHT - 80;
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('吃饭匹配神器 - 让团队聚餐更简单', CANVAS_WIDTH / 2, footerY);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png', 0.95);
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
