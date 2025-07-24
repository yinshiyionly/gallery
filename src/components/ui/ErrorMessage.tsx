import React from 'react';
import { Alert } from './Alert';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

/**
 * 错误消息组件
 * 用于显示用户友好的错误信息，并提供重试选项
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = '出错了',
  message,
  retry,
  className,
}) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-6 ${className}`}>
      <div className="w-full max-w-md">
        <Alert
          variant="error"
          title={title}
          className="mb-4"
        >
          <p className="text-sm">{message}</p>
        </Alert>
        
        {retry && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={retry}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              重试
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};