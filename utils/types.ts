/* eslint-disable no-unused-vars */
export {};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export interface ImageProps {
  id: number;
  height: string;
  width: string;
  public_id: string;
  format: string;
  blurDataUrl?: string;
    context?: {
    custom?: {
      alt: string;
      title?: string;
      description?: string;
    };
  };
}

export interface SharedModalProps {
  index: number;
  images?: ImageProps[];
  currentPhoto?: ImageProps;
  changePhotoId: (newVal: number) => void;
  closeModal: () => void;
  navigation: boolean;
  direction?: number;
}
