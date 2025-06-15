interface Window {
  clarity: (
    command: string,
    eventName: string,
    data?: {
      [key: string]: any;
    }
  ) => void;
} 