interface EmailPreview {
  previewUrl: string;
  subject: string;
  timestamp: number;
}

interface EmailPreviewButtonProps {
  email: string;
  className?: string;
}
