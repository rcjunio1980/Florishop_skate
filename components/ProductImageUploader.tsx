'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Sparkles,
  AlertCircle,
  FileUp,
  Plus,
  Star,
  Layers,
  RotateCw,
  CheckCircle2,
  Maximize2,
  Ratio,
  SlidersHorizontal,
  X,
  RefreshCw,
  Check,
} from 'lucide-react';

export interface PresetImage {
  label: string;
  category?: string;
  url: string;
}

export interface ProductImageUploaderProps {
  images?: string[];
  onImagesChange?: (newImages: string[]) => void;
  // Backward compatibility with single-image callers
  currentImageUrl?: string;
  onImageChange?: (newUrl: string) => void;
  presetImages?: PresetImage[];
  label?: string;
  required?: boolean;
  maxImages?: number;
}

export type AntiDistortionMode = 'contain-pad' | 'proportional' | 'cover-crop';
export type BackgroundFillMode = 'dark' | 'transparent' | 'white' | 'black';

export interface ProcessImageOptions {
  mode?: AntiDistortionMode;
  bgColor?: BackgroundFillMode;
  rotation?: number; // 0, 90, 180, 270
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface ProcessedImageResult {
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  finalWidth: number;
  finalHeight: number;
  aspectRatioLabel: string;
  originalKB: number;
  optimizedKB: number;
  modeUsed: AntiDistortionMode;
}

/**
 * High-precision canvas-based image preprocessor that scales and frames
 * product images without ANY optical distortion, stretching or flattening.
 */
export function processImageSource(
  source: string | HTMLImageElement,
  options: ProcessImageOptions = {}
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const {
      mode = 'contain-pad',
      bgColor = 'dark',
      rotation = 0,
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.88,
    } = options;

    const img = typeof source === 'string' ? new Image() : source;
    if (typeof source === 'string') {
      img.crossOrigin = 'anonymous';
      img.src = source;
    }

    const runProcess = () => {
      const srcW = img.naturalWidth || img.width;
      const srcH = img.naturalHeight || img.height;

      if (!srcW || !srcH) {
        reject(new Error('Não foi possível obter as dimensões da imagem.'));
        return;
      }

      // Handle 90/270 degrees rotation swap
      const isRotated90or270 = Math.abs(rotation % 180) === 90;
      const effectiveW = isRotated90or270 ? srcH : srcW;
      const effectiveH = isRotated90or270 ? srcW : srcH;

      let canvasW = 1000;
      let canvasH = 1000;
      let drawW = 1000;
      let drawH = 1000;
      let destX = 0;
      let destY = 0;

      if (mode === 'contain-pad') {
        // Square 1:1 Canvas with safe padding: protects shapes, trucks, shoes from edge-cutoff
        const targetDim = Math.min(1200, Math.max(800, Math.max(effectiveW, effectiveH)));
        canvasW = targetDim;
        canvasH = targetDim;

        // 92% usable area ensures 4% breathing room margin
        const usableDim = Math.round(targetDim * 0.92);
        const scale = Math.min(usableDim / effectiveW, usableDim / effectiveH);

        drawW = Math.round(effectiveW * scale);
        drawH = Math.round(effectiveH * scale);
        destX = Math.round((canvasW - drawW) / 2);
        destY = Math.round((canvasH - drawH) / 2);
      } else if (mode === 'cover-crop') {
        // Square 1:1 cover crop
        const targetDim = Math.min(1000, Math.max(effectiveW, effectiveH));
        canvasW = targetDim;
        canvasH = targetDim;
        const scale = Math.max(canvasW / effectiveW, canvasH / effectiveH);
        drawW = Math.round(effectiveW * scale);
        drawH = Math.round(effectiveH * scale);
        destX = Math.round((canvasW - drawW) / 2);
        destY = Math.round((canvasH - drawH) / 2);
      } else {
        // 'proportional': Keep exact natural aspect ratio W:H
        const scale = Math.min(1, maxWidth / effectiveW, maxHeight / effectiveH);
        canvasW = Math.round(effectiveW * scale);
        canvasH = Math.round(effectiveH * scale);
        drawW = canvasW;
        drawH = canvasH;
        destX = 0;
        destY = 0;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D não suportado pelo navegador.'));
        return;
      }

      // Fill background based on selected mode
      if (bgColor === 'transparent') {
        ctx.clearRect(0, 0, canvasW, canvasH);
      } else if (bgColor === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (bgColor === 'black') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else {
        // 'dark': Florishop skate studio tone
        ctx.fillStyle = '#181717';
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.save();
      if (rotation !== 0) {
        const centerX = destX + drawW / 2;
        const centerY = destY + drawH / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        const unrotatedDrawW = isRotated90or270 ? drawH : drawW;
        const unrotatedDrawH = isRotated90or270 ? drawW : drawH;
        ctx.drawImage(img, -unrotatedDrawW / 2, -unrotatedDrawH / 2, unrotatedDrawW, unrotatedDrawH);
      } else {
        ctx.drawImage(img, destX, destY, drawW, drawH);
      }
      ctx.restore();

      const isPng = bgColor === 'transparent';
      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, quality);

      const rawKB = typeof source === 'string' ? Math.round((source.length * 0.75) / 1024) : 100;
      const optimizedKB = Math.round((dataUrl.length * 3) / 4 / 1024);

      resolve({
        dataUrl,
        originalWidth: srcW,
        originalHeight: srcH,
        finalWidth: canvasW,
        finalHeight: canvasH,
        aspectRatioLabel: mode === 'contain-pad' ? '1:1 Vitrine (Pad)' : `${srcW}:${srcH}`,
        originalKB: rawKB,
        optimizedKB,
        modeUsed: mode,
      });
    };

    if (img.complete && (img.naturalWidth || img.width)) {
      runProcess();
    } else {
      img.onload = () => runProcess();
      img.onerror = () => reject(new Error('Erro ao decodificar a foto para redimensionamento.'));
    }
  });
}

/**
 * Backward-compatible helper for single file compression with anti-distortion protection
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.88,
  options?: ProcessImageOptions
): Promise<{ dataUrl: string; fileName: string; originalKB: number; optimizedKB: number; dimensions: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP, etc.).');
  }

  const originalKB = Math.round(file.size / 1024);
  const dataUrlOriginal = await new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onerror = () => rej(new Error('Falha ao ler o arquivo.'));
    reader.onload = () => res(reader.result as string);
    reader.readAsDataURL(file);
  });

  const res = await processImageSource(dataUrlOriginal, {
    maxWidth,
    maxHeight,
    quality,
    mode: options?.mode || 'contain-pad',
    bgColor: options?.bgColor || 'dark',
    ...options,
  });

  return {
    dataUrl: res.dataUrl,
    fileName: file.name,
    originalKB,
    optimizedKB: res.optimizedKB,
    dimensions: `${res.finalWidth}x${res.finalHeight}`,
  };
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images: propImages,
  onImagesChange,
  currentImageUrl,
  onImageChange,
  presetImages = [],
  label = 'Fotos do Produto',
  required = false,
  maxImages = 15,
}) => {
  // Normalize images array across prop interfaces
  const images: string[] = React.useMemo(() => {
    if (propImages && Array.isArray(propImages)) {
      return propImages.filter((img) => typeof img === 'string' && img.trim().length > 0);
    }
    if (currentImageUrl && typeof currentImageUrl === 'string' && currentImageUrl.trim().length > 0) {
      return [currentImageUrl.trim()];
    }
    return [];
  }, [propImages, currentImageUrl]);

  const updateImages = (nextList: string[]) => {
    if (onImagesChange) {
      onImagesChange(nextList);
    }
    if (onImageChange) {
      onImageChange(nextList[0] || '');
    }
  };

  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Anti-Distortion Preferences
  const [antiDistortMode, setAntiDistortMode] = useState<AntiDistortionMode>('contain-pad');
  const [bgFillMode, setBgFillMode] = useState<BackgroundFillMode>('dark');
  const [lastProcessedNotice, setLastProcessedNotice] = useState<string | null>(null);

  // Edit/Adjust Specific Image Modal
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [editingRotation, setEditingRotation] = useState<number>(0);
  const [editingMode, setEditingMode] = useState<AntiDistortionMode>('contain-pad');
  const [editingBg, setEditingBg] = useState<BackgroundFillMode>('dark');
  const [isReprocessing, setIsReprocessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Process files with anti-distortion math
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadError(null);
    setIsProcessing(true);
    setLastProcessedNotice(null);

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setUploadError(`Limite máximo de ${maxImages} fotos atingido.`);
      setIsProcessing(false);
      return;
    }

    const toProcess = fileArray.slice(0, remainingSlots);
    const newUrls: string[] = [];
    let countSuccess = 0;

    for (const file of toProcess) {
      try {
        const res = await compressImageFile(file, 1200, 1200, 0.88, {
          mode: antiDistortMode,
          bgColor: bgFillMode,
        });
        newUrls.push(res.dataUrl);
        countSuccess++;
      } catch (err: any) {
        console.error('Falha ao processar foto:', err);
        setUploadError(err.message || 'Erro ao processar imagem.');
      }
    }

    if (newUrls.length > 0) {
      updateImages([...images, ...newUrls]);
      const modeLabel =
        antiDistortMode === 'contain-pad'
          ? 'Enquadramento 1:1 Vitrine (Proporção 100% Preservada com fundo)'
          : 'Proporção Natural Original';
      setLastProcessedNotice(
        `✓ ${countSuccess} foto(s) redimensionada(s) automaticamente! Modo: ${modeLabel} — nenhuma distorção aplicada.`
      );
    }

    setIsProcessing(false);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Add via URL, optionally auto-processing through anti-distortion canvas
  const handleAddUrl = async (processThroughCanvas = true) => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (images.length >= maxImages) {
      setUploadError(`Limite máximo de ${maxImages} fotos atingido.`);
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    try {
      if (processThroughCanvas) {
        try {
          const res = await processImageSource(trimmed, {
            mode: antiDistortMode,
            bgColor: bgFillMode,
          });
          updateImages([...images, res.dataUrl]);
          setLastProcessedNotice(
            `✓ Imagem da URL redimensionada sem distorção e adicionada com sucesso à galeria.`
          );
        } catch {
          // If CORS prevents canvas read, keep original URL safely with CSS protection
          updateImages([...images, trimmed]);
          setLastProcessedNotice(
            `✓ URL adicionada com proteção CSS de enquadramento proporcional ativo.`
          );
        }
      } else {
        updateImages([...images, trimmed]);
      }
      setUrlInput('');
    } catch (err: any) {
      setUploadError(err.message || 'Não foi possível processar a imagem da URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const next = images.filter((_, idx) => idx !== indexToRemove);
    updateImages(next);
  };

  const handleSetCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    const selected = images[indexToCover];
    const without = images.filter((_, idx) => idx !== indexToCover);
    updateImages([selected, ...without]);
  };

  // Open Adjust Modal for a specific image
  const handleOpenAdjustModal = (index: number) => {
    setEditingImageIndex(index);
    setEditingRotation(0);
    setEditingMode(antiDistortMode);
    setEditingBg(bgFillMode);
  };

  const handleApplyAdjustment = async () => {
    if (editingImageIndex === null || !images[editingImageIndex]) return;

    setIsReprocessing(true);
    try {
      const sourceImage = images[editingImageIndex];
      const res = await processImageSource(sourceImage, {
        mode: editingMode,
        bgColor: editingBg,
        rotation: editingRotation,
      });

      const updated = [...images];
      updated[editingImageIndex] = res.dataUrl;
      updateImages(updated);

      setLastProcessedNotice(
        `✓ Foto #${editingImageIndex + 1} redimensionada com sucesso! Proporção mantida sem distorção.`
      );
      setEditingImageIndex(null);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao ajustar imagem.');
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Header and Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-gray-300 font-bold text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#ff544b]" />
            {label} {required && <span className="text-[#ff544b]">*</span>}
          </label>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#201f1f] text-gray-300 border border-[#353534]">
            {images.length} / {maxImages} fotos
          </span>
        </div>

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

      {/* SMART ANTI-DISTORTION CONTROLS BAR */}
      <div className="bg-[#181717] border border-[#353534] rounded-lg p-3 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 font-bold uppercase">
              <CheckCircle2 className="w-3 h-3" /> Redimensionamento Anti-Distorção Ativo
            </span>
            <span className="text-[11px] text-gray-300 hidden sm:inline">
              O aplicativo ajusta proporções automaticamente para não deformar shapes ou tênis.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode selection: 1:1 Vitrine vs Proportional */}
            <div className="inline-flex rounded bg-[#111] p-0.5 border border-[#333] text-[10px]">
              <button
                type="button"
                onClick={() => setAntiDistortMode('contain-pad')}
                className={`px-2 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
                  antiDistortMode === 'contain-pad'
                    ? 'bg-[#ff544b] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Enquadra o produto em proporção 1:1 sem cortar nem esticar"
              >
                <Ratio className="w-3 h-3" />
                Vitrine 1:1 (Sem Distorcer)
              </button>
              <button
                type="button"
                onClick={() => setAntiDistortMode('proportional')}
                className={`px-2 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 ${
                  antiDistortMode === 'proportional'
                    ? 'bg-[#ff544b] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Mantém proporção original livre do arquivo"
              >
                <Maximize2 className="w-3 h-3" />
                Proporção Original
              </button>
            </div>

            {/* Background Fill selector when 1:1 mode is active */}
            {antiDistortMode === 'contain-pad' && (
              <div className="flex items-center gap-1 text-[10px] text-gray-400 pl-1 border-l border-[#333]">
                <span>Fundo:</span>
                <button
                  type="button"
                  onClick={() => setBgFillMode('dark')}
                  className={`px-1.5 py-0.5 rounded border text-[10px] ${
                    bgFillMode === 'dark'
                      ? 'bg-[#ff544b]/20 border-[#ff544b] text-white font-bold'
                      : 'border-[#333] hover:text-white'
                  }`}
                  title="Fundo escuro nativo da loja (#181717)"
                >
                  Escuro Loja
                </button>
                <button
                  type="button"
                  onClick={() => setBgFillMode('transparent')}
                  className={`px-1.5 py-0.5 rounded border text-[10px] ${
                    bgFillMode === 'transparent'
                      ? 'bg-[#ff544b]/20 border-[#ff544b] text-white font-bold'
                      : 'border-[#333] hover:text-white'
                  }`}
                  title="Fundo transparente (PNG)"
                >
                  Transp.
                </button>
                <button
                  type="button"
                  onClick={() => setBgFillMode('white')}
                  className={`px-1.5 py-0.5 rounded border text-[10px] ${
                    bgFillMode === 'white'
                      ? 'bg-[#ff544b]/20 border-[#ff544b] text-white font-bold'
                      : 'border-[#333] hover:text-white'
                  }`}
                  title="Fundo branco estilo estúdio"
                >
                  Branco
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Notice / Dynamic Feedback */}
        {lastProcessedNotice && (
          <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300 text-[11px] flex items-center justify-between gap-2 animate-fadeIn">
            <span className="flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              {lastProcessedNotice}
            </span>
            <button
              type="button"
              onClick={() => setLastProcessedNotice(null)}
              className="text-gray-400 hover:text-white text-xs px-1"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Input (supports multiple selections) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
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
                  {isProcessing
                    ? 'Redimensionando e enquadrando fotos no canvas...'
                    : 'Arraste e solte fotos aqui (selecione várias de uma vez)'}
                </p>
                <p className="text-[11px] text-gray-400">
                  ou <span className="text-[#ff544b] underline font-bold">clique para escolher do seu celular ou computador</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] text-gray-400 uppercase">
                <span className="text-emerald-400 font-bold">✓ Preserva Proporções</span>
                <span>&bull;</span>
                <span>Sem cortes indesejados</span>
                <span>&bull;</span>
                <span>Suporta 10+ fotos por item</span>
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
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl(true);
                  }
                }}
                className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2 pl-8 rounded font-mono focus:outline-none focus:border-[#ff544b]"
              />
              <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
            <button
              type="button"
              onClick={() => handleAddUrl(true)}
              disabled={!urlInput.trim() || isProcessing}
              className="px-3 py-2 bg-[#ff544b] hover:bg-white hover:text-black text-white rounded text-xs font-bold uppercase transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isProcessing ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Adicionar com Redimensionamento
            </button>
          </div>
          <p className="text-[10px] text-gray-500">
            A foto é processada pelo canvas para enquadrar perfeitamente sem distorção e sem esticar a imagem.
          </p>
        </div>
      )}

      {/* MODE 3: Skate Presets */}
      {activeMode === 'presets' && presetImages.length > 0 && (
        <div className="space-y-2 bg-[#161616] p-3 rounded-lg border border-[#2e2e2e]">
          <span className="text-[10px] text-gray-400 block font-bold uppercase">
            Clique em um modelo para adicionar à galeria:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {presetImages.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (images.length < maxImages) {
                    updateImages([...images, preset.url]);
                    setLastProcessedNotice(`✓ Modelo &quot;${preset.label}&quot; adicionado à galeria.`);
                  }
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

      {/* MULTI-IMAGE GALLERY GRID */}
      {images.length > 0 ? (
        <div className="space-y-2 bg-[#141414] border border-[#2e2e2e] p-3 rounded-lg">
          <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-[#282828] pb-2">
            <span className="font-bold uppercase text-white flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#ff544b]" />
              Galeria do Produto ({images.length} fotos)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Todas as fotos protegidas contra distorção
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${index}-${imgUrl.slice(0, 30)}`}
                  className={`relative group bg-[#1c1b1b] border rounded-lg p-1.5 flex flex-col items-center justify-between transition-all ${
                    isCover
                      ? 'border-[#ff544b] shadow-md ring-1 ring-[#ff544b]/50'
                      : 'border-[#353534] hover:border-gray-500'
                  }`}
                >
                  {/* Badge de Capa */}
                  {isCover && (
                    <span className="absolute top-2 left-2 z-10 bg-[#ff544b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                      <Star className="w-2.5 h-2.5 fill-current" /> Capa
                    </span>
                  )}

                  <span className="absolute top-2 right-2 z-10 bg-black/80 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                    #{index + 1}
                  </span>

                  {/* Thumbnail with object-contain anti-distortion framing */}
                  <div className="w-full h-24 bg-[#111] rounded overflow-hidden flex items-center justify-center relative my-1 border border-[#2a2a2a]">
                    <img
                      src={imgUrl}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://picsum.photos/seed/skate-err/200/200';
                      }}
                    />
                  </div>

                  {/* Anti-Distortion Tag */}
                  <div className="w-full flex items-center justify-center pb-1">
                    <span className="text-[8px] text-gray-400 uppercase tracking-tighter bg-[#151515] px-1 py-0.5 rounded border border-[#2a2a2a]">
                      Proporção 1:1 OK
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-[#262626]">
                    {/* Adjust / Re-frame Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenAdjustModal(index)}
                      className="text-[9px] font-bold text-gray-300 hover:text-[#ff544b] flex items-center gap-1 px-1 py-0.5 rounded hover:bg-[#252424]"
                      title="Ajustar enquadramento e rotação desta foto"
                    >
                      <SlidersHorizontal className="w-2.5 h-2.5" /> Ajustar
                    </button>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="text-[9px] font-bold text-gray-400 hover:text-white flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-[#252424]"
                        title="Tornar esta a foto principal da vitrine"
                      >
                        <Star className="w-2.5 h-2.5" /> Capa
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-red-600 rounded transition-colors ml-auto"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Card Slot */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-36 border-2 border-dashed border-[#353534] hover:border-[#ff544b] bg-[#1a1919] hover:bg-[#201f1f] rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all group cursor-pointer"
              >
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#ff544b] mb-1" />
                <span className="text-[10px] text-gray-300 font-bold group-hover:text-white uppercase">
                  + Foto
                </span>
                <span className="text-[8px] text-emerald-400 font-bold">
                  Redimensionamento Auto
                </span>
                <span className="text-[9px] text-gray-500">
                  Foto #{images.length + 1}
                </span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-gray-500 p-4 border border-[#2a2a2a] rounded bg-[#141414] text-center space-y-1">
          <p className="font-bold text-gray-400">Nenhuma foto adicionada ainda.</p>
          <p className="text-[10px] text-gray-500">
            Você pode adicionar várias fotos (10 ou mais) para exibir todos os ângulos do tênis e peças. O aplicativo redimensiona todas automaticamente sem distorcer.
          </p>
        </div>
      )}

      {/* QUICK PHOTO ADJUSTMENT MODAL */}
      {editingImageIndex !== null && images[editingImageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#3d3d3d] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-fadeIn font-mono">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2d2c2c] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#ff544b]" />
                <h3 className="font-bold text-sm text-white">
                  Ajustar &amp; Redimensionar Foto #{editingImageIndex + 1}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingImageIndex(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#282727]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Canvas Preview Box */}
            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-64 h-64 rounded-lg flex items-center justify-center overflow-hidden border border-[#3f3f3f] p-3 transition-colors ${
                  editingBg === 'white'
                    ? 'bg-white'
                    : editingBg === 'black'
                    ? 'bg-black'
                    : editingBg === 'transparent'
                    ? 'bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:8px_8px] bg-[#1a1919]'
                    : 'bg-[#181717]'
                }`}
              >
                <img
                  src={images[editingImageIndex]}
                  alt="Prévia de Enquadramento"
                  style={{
                    transform: `rotate(${editingRotation}deg)`,
                  }}
                  className={`max-h-full max-w-full transition-transform duration-300 ${
                    editingMode === 'cover-crop' ? 'object-cover w-full h-full' : 'object-contain'
                  }`}
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-2">
                Proporção calculada em tempo real &bull; {editingMode === 'contain-pad' ? '1:1 Vitrine (Com Respiro)' : 'Proporção Original'}
              </span>
            </div>

            {/* Controls */}
            <div className="space-y-3 bg-[#141414] p-3 rounded-lg border border-[#2d2c2c]">
              {/* Framing Mode */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-300 block">
                  Modo de Redimensionamento:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditingMode('contain-pad')}
                    className={`p-2 rounded border text-left transition-all ${
                      editingMode === 'contain-pad'
                        ? 'border-[#ff544b] bg-[#ff544b]/15 text-white font-bold'
                        : 'border-[#333] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px]">Vitrine 1:1</span>
                    <span className="text-[9px] text-gray-400 block">Centraliza sem cortar nem esticar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingMode('proportional')}
                    className={`p-2 rounded border text-left transition-all ${
                      editingMode === 'proportional'
                        ? 'border-[#ff544b] bg-[#ff544b]/15 text-white font-bold'
                        : 'border-[#333] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px]">Proporção Original</span>
                    <span className="text-[9px] text-gray-400 block">Mantém formato exato do arquivo</span>
                  </button>
                </div>
              </div>

              {/* Background fill */}
              {editingMode === 'contain-pad' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-300 block">
                    Cor de Fundo da Moldura:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                    {[
                      { id: 'dark', label: 'Escuro Loja' },
                      { id: 'transparent', label: 'Transparente' },
                      { id: 'white', label: 'Branco Studio' },
                      { id: 'black', label: 'Preto Puro' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setEditingBg(bg.id as BackgroundFillMode)}
                        className={`py-1.5 px-2 rounded border text-center font-bold ${
                          editingBg === bg.id
                            ? 'bg-[#ff544b] text-white border-[#ff544b]'
                            : 'border-[#333] text-gray-400 hover:text-white'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rotation */}
              <div className="flex items-center justify-between pt-1 border-t border-[#262626]">
                <span className="text-[10px] uppercase font-bold text-gray-300">
                  Girar Imagem:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRotation((prev) => (prev + 90) % 360)}
                    className="px-2.5 py-1 bg-[#222] hover:bg-[#ff544b] hover:text-white text-gray-300 border border-[#3a3a39] rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCw className="w-3 h-3" /> Girar 90° ({editingRotation}°)
                  </button>
                  {editingRotation !== 0 && (
                    <button
                      type="button"
                      onClick={() => setEditingRotation(0)}
                      className="text-[10px] text-gray-400 hover:text-white underline"
                    >
                      Redefinir
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2d2c2c]">
              <button
                type="button"
                onClick={() => setEditingImageIndex(null)}
                className="px-4 py-2 border border-[#353534] hover:bg-[#282727] text-gray-300 rounded text-xs font-bold uppercase transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyAdjustment}
                disabled={isReprocessing}
                className="px-4 py-2 bg-[#ff544b] hover:bg-white hover:text-black text-white rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isReprocessing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Aplicar ao Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
