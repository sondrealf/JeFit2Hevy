interface Window {
  gtag: (
    command: string,
    action: string,
    params?: {
      event_category?: string;
      event_label?: string;
      [key: string]: any;
    }
  ) => void;
} 