export type DocumentRowStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface DocumentRowProps {
  label: string;
  status: DocumentRowStatus;
  progress?: number;
  onPress: () => void;
}
