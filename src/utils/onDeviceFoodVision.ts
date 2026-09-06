import { registerPlugin } from '@capacitor/core';

export interface OnDeviceFoodLabel {
  text: string;
  confidence: number;
  index: number;
}

interface OnDeviceFoodVisionPlugin {
  processImage(options: { imageBase64: string; mimeType?: string }): Promise<{
    labels: OnDeviceFoodLabel[];
    onDevice: boolean;
    model: string;
  }>;
}

const OnDeviceFoodVision = registerPlugin<OnDeviceFoodVisionPlugin>('OnDeviceFoodVision');

export async function analyzeFoodOnDevice(imageBase64: string, mimeType = 'image/jpeg') {
  if (!imageBase64) return null;
  try {
    const result = await OnDeviceFoodVision.processImage({ imageBase64, mimeType });
    const labels = Array.isArray(result?.labels) ? result.labels.filter(label => Number(label.confidence) >= 0.55) : [];
    return {
      labels,
      model: result?.model || 'ML Kit bundled image-labeling',
      onDevice: true,
    };
  } catch {
    return null;
  }
}
