import { useState } from 'react';
import { Share2, Download, Copy, Check, X, Loader2 } from 'lucide-react';
import { MatchResult, Person } from '@/types';
import { generateShareImage, downloadImage } from '@/utils/generateShareImage';

interface ShareButtonProps {
  topResult: MatchResult;
  people: Person[];
  shareUrl: string;
  totalResults: number;
  variant?: 'button' | 'icon';
}

export function ShareButton({ 
  topResult, 
  people, 
  shareUrl, 
  totalResults,
  variant = 'button' 
}: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateImage = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await generateShareImage({
        topResult,
        people,
        shareUrl,
        totalResults,
      });
      setPreviewImage(dataUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to generate share image:', error);
      alert('生成分享图片失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (previewImage) {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadImage(previewImage, `餐厅匹配结果-${timestamp}.png`);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white transition-all"
          title="分享"
        >
          {isGenerating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Share2 size={18} />
          )}
        </button>
        
        {showPreview && (
          <SharePreviewModal
            previewImage={previewImage}
            onClose={() => setShowPreview(false)}
            onDownload={handleDownload}
            onCopyLink={handleCopyLink}
            copied={copied}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleGenerateImage}
        disabled={isGenerating}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isGenerating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            生成分享图片中...
          </>
        ) : (
          <>
            <Share2 size={20} />
            生成分享图片
          </>
        )}
      </button>
      
      {showPreview && (
        <SharePreviewModal
          previewImage={previewImage}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
          onCopyLink={handleCopyLink}
          copied={copied}
        />
      )}
    </>
  );
}

interface SharePreviewModalProps {
  previewImage: string;
  onClose: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

function SharePreviewModal({ 
  previewImage, 
  onClose, 
  onDownload,
  onCopyLink,
  copied 
}: SharePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-lg text-gray-800">分享图片</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <img
            src={previewImage}
            alt="分享图片预览"
            className="w-full rounded-2xl shadow-lg"
          />
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onCopyLink}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-500" />
                已复制
              </>
            ) : (
              <>
                <Copy size={18} />
                复制链接
              </>
            )}
          </button>
          <button
            onClick={onDownload}
            className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            保存图片
          </button>
        </div>
      </div>
    </div>
  );
}
