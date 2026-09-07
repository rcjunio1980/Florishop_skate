'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  FileUp,
} from 'lucide-react';

export interface PresetImage {
  label: string;
  category?: string;
  url: string;
}

interface ProductImageUploaderProps {
  currentImageUrl: string;
  onImageChange: (newUrl: string) => void;
  presetImages?: PresetImage[];
  label?: string;
  required?: boolean;
}

/**
 * Resizes and compresses an image file using an HTML5 Canvas,
 * reducing multi-megabyte photos down to a fast-loading, storage-friendly data URL.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ dataUrl: string; fileName: string; originalKB: number; optimizedKB: number; dimensions: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP, etc.).'));
      return;
    }

    const originalKB = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Não foi possível carregar a imagem. Formato corrompido ou incompatível.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down proportionally if larger than maximum limits
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback to original data URL if canvas context fails
          const rawUrl = event.target?.result as string;
          resolve({
            dataUrl: rawUrl,
            fileName: file.name,
            originalKB,
            optimizedKB: Math.round((rawUrl.length * 3) / 4 / 1024),
            dimensions: `${img.width}x${img.height}`,
          });
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if original is PNG, otherwise use JPEG for smaller size
        const isPng = file.type === 'image/png';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const optimizedKB = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          fileName: file.name,
          originalKB,
          optimizedKB,
          dimensions: `${width}x${height}`,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  currentImageUrl,
  onImageChange,
  presetImages = [],
  label = 'Foto do Produto',
  required = false,
}) => {
  // Determine initial mode based on current URL
  const isLocalDataUrl = currentImageUrl.startsWith('data:image/');
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>(
    isLocalDataUrl ? 'upload' : currentImageUrl ? 'url' : 'upload'
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    fileName: string;
    originalKB: number;
    optimizedKB: number;
    dimensions: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setIsProcessing(true);

    try {
      const result = await compressImageFile(file);
      onImageChange(result.dataUrl);
      setFileDetails({
        fileName: result.fileName,
        originalKB: result.originalKB,
        optimizedKB: result.optimizedKB,
        dimensions: result.dimensions,
      });
      setActiveMode('upload');
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input value so re-selecting same file triggers change
    if (e.target) e.target.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange('');
    setFileDetails(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Label and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-gray-300 font-bold text-xs flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[#ff544b]" />
          {label} {required && <span className="text-[#ff544b]">*</span>}
        </label>

        {/* Upload Mode Selector Pills */}
        <div className="inline-flex rounded bg-[#161616] p-0.5 border border-[#333] text-[11px]">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
              activeMode === 'upload'
                ? 'bg-[#ff544b] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            Arquivo Local
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
              activeMode === 'url'
                ? 'bg-[#ff544b] text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Link / URL
          </button>
          {presetImages.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveMode('presets')}
              className={`px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
                activeMode === 'presets'
                  ? 'bg-[#ff544b] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Exemplos
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input for Local Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* MODE 1: Local File Upload (Drag & Drop Zone + Picker) */}
      {activeMode === 'upload' && (
        <div className="space-y-2.5">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200 relative ${
              isDragging
                ? 'border-[#ff544b] bg-[#ff544b]/10 scale-[1.01]'
                : 'border-[#3a3a39] hover:border-[#ff544b] bg-[#1a1919] hover:bg-[#201f1f]'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-11 h-11 rounded-full bg-[#262525] border border-[#3f3e3e] flex items-center justify-center text-[#ff544b] group-hover:scale-110 transition-transform shadow-inner">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-[#ff544b] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileUp className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-white font-bold">
                  {isProcessing ? 'Comprimindo e preparando foto...' : 'Arraste e solte sua foto aqui'}
                </p>
                <p className="text-[11px] text-gray-400">
                  ou <span className="text-[#ff544b] underline font-bold">clique para selecionar do seu dispositivo</span>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[10px] text-gray-500 uppercase">
                <span>PNG, JPG ou WebP</span>
                <span>&bull;</span>
                <span>Otimizado automaticamente</span>
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/50 rounded text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Web URL input */}
      {activeMode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="url"
                placeholder="https://exemplo.com/imagem-skate.jpg"
                value={currentImageUrl.startsWith('data:image/') ? '' : currentImageUrl}
                onChange={(e) => {
                  onImageChange(e.target.value.trim());
                  setFileDetails(null);
                }}
                className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2 pl-8 rounded font-mono focus:outline-none focus:border-[#ff544b]"
              />
              <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
            {currentImageUrl && !currentImageUrl.startsWith('data:image/') && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 bg-[#252424] hover:bg-red-600 text-gray-400 hover:text-white rounded border border-[#353534] transition-colors"
                title="Limpar URL"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            Cole um link direto de imagem HTTPS (Unsplash, Imgur, Supabase, Cloudinary, etc.).
          </p>
        </div>
      )}

      {/* MODE 3: Skate Presets */}
      {activeMode === 'presets' && presetImages.length > 0 && (
        <div className="space-y-2 bg-[#161616] p-3 rounded-lg border border-[#2e2e2e]">
          <span className="text-[10px] text-gray-400 block font-bold uppercase">
            Clique em uma foto modelo para carregar instantaneamente:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetImages.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onImageChange(preset.url);
                  setFileDetails(null);
                }}
                className="p-2 bg-[#201f1f] hover:bg-[#2a2a2a] hover:border-[#ff544b] border border-[#333] rounded text-left flex items-center gap-2 group transition-all"
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-8 h-8 object-contain bg-[#111] rounded p-0.5 border border-[#444] flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-white block truncate group-hover:text-[#ff544b]">
                    {preset.label}
                  </span>
                  {preset.category && (
                    <span className="text-[9px] text-gray-500 block truncate">
                      {preset.category}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE PREVIEW CARD (Visible regardless of mode when an image exists) */}
      {currentImageUrl ? (
        <div className="bg-[#181717] border border-[#333] p-3 rounded-lg flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            {/* Visual Thumbnail */}
            <div className="w-14 h-14 bg-[#111] border border-[#444] rounded p-1 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
              <img
                src={currentImageUrl}
                alt="Prévia do produto"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://picsum.photos/seed/skate-error/200/200';
                }}
              />
            </div>

            {/* Image Status and Metadata */}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded uppercase inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  {currentImageUrl.startsWith('data:image/') ? 'Foto Local Carregada' : 'Link Web Ativo'}
                </span>
                {fileDetails && (
                  <span className="text-[10px] text-gray-400">
                    {fileDetails.dimensions} &bull; {fileDetails.optimizedKB} KB
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white font-bold truncate">
                {fileDetails?.fileName || (currentImageUrl.startsWith('data:image/') ? 'Arquivo do Computador/Celular' : currentImageUrl)}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Esta foto será exibida no site, vitrine, catálogo e carrinho.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-[#252424] hover:bg-[#ff544b] text-white rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1 border border-[#3a3a39]"
              title="Trocar por outra foto do computador"
            >
              <Upload className="w-3 h-3" />
              Trocar
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1.5 bg-[#252424] hover:bg-red-600 text-gray-400 hover:text-white rounded border border-[#3a3a39] transition-colors"
              title="Remover foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-gray-500 p-2 border border-[#2a2a2a] rounded bg-[#141414] text-center">
          Nenhuma foto selecionada ainda. Faça upload de uma foto do computador ou insira uma URL acima.
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
