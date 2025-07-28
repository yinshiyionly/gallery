import { useRef, useEffect, useCallback } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
}

interface UseTouchOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onPinch?: (gesture: PinchGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onDoubleTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  preventDefault?: boolean;
}

/**
 * 触摸手势识别Hook
 * 支持滑动、缩放、点击、双击、长按等手势
 */
export const useTouch = (options: UseTouchOptions = {}) => {
  const {
    onSwipe,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    longPressDelay = 500,
    doubleTapDelay = 300,
    preventDefault = true
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchesRef = useRef<Touch[]>([]);
  const lastTapRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDistanceRef = useRef<number>(0);
  const initialCenterRef = useRef<{ x: number; y: number } | null>(null);

  // 获取触摸点坐标
  const getTouchPoint = useCallback((touch: Touch): TouchPoint => ({
    x: touch.clientX,
    y: touch.clientY,
    timestamp: Date.now()
  }), []);

  // 计算两点距离
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // 计算两点中心
  const getCenter = useCallback((touch1: Touch, touch2: Touch) => ({
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2
  }), []);

  // 计算滑动方向
  const getSwipeDirection = useCallback((start: TouchPoint, end: TouchPoint): 'left' | 'right' | 'up' | 'down' => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }, []);

  // 清除长按定时器
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 触摸开始处理
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }

    const touches = Array.from(event.touches);
    touchesRef.current = touches;

    if (touches.length === 1) {
      // 单指触摸
      const touchPoint = getTouchPoint(touches[0]);
      touchStartRef.current = touchPoint;

      // 设置长按定时器
      longPressTimerRef.current = setTimeout(() => {
        if (onLongPress && touchStartRef.current) {
          onLongPress(touchStartRef.current);
        }
      }, longPressDelay);

    } else if (touches.length === 2) {
      // 双指触摸（缩放）
      clearLongPressTimer();
      initialDistanceRef.current = getDistance(touches[0], touches[1]);
      initialCenterRef.current = getCenter(touches[0], touches[1]);
    }
  }, [getTouchPoint, getDistance, getCenter, onLongPress, longPressDelay, preventDefault, clearLongPressTimer]);

  // 触摸移动处理
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }

    const touches = Array.from(event.touches);
    touchesRef.current = touches;

    if (touches.length === 1) {
      // 单指移动时清除长按定时器
      clearLongPressTimer();
    } else if (touches.length === 2 && onPinch) {
      // 双指缩放
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentCenter = getCenter(touches[0], touches[1]);
      
      if (initialDistanceRef.current > 0) {
        const scale = currentDistance / initialDistanceRef.current;
        
        if (Math.abs(scale - 1) > pinchThreshold) {
          onPinch({
            scale,
            center: currentCenter
          });
        }
      }
    }
  }, [getDistance, getCenter, onPinch, pinchThreshold, preventDefault, clearLongPressTimer]);

  // 触摸结束处理
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }

    clearLongPressTimer();

    const touches = Array.from(event.changedTouches);
    
    if (touches.length === 1 && touchStartRef.current) {
      const touchEnd = getTouchPoint(touches[0]);
      const dx = touchEnd.x - touchStartRef.current.x;
      const dy = touchEnd.y - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const duration = touchEnd.timestamp - touchStartRef.current.timestamp;

      if (distance > swipeThreshold && onSwipe) {
        // 滑动手势
        const direction = getSwipeDirection(touchStartRef.current, touchEnd);
        const velocity = distance / duration;
        
        onSwipe({
          direction,
          distance,
          velocity,
          duration
        });
      } else if (distance < 10 && duration < 200) {
        // 点击手势
        if (lastTapRef.current && 
            touchEnd.timestamp - lastTapRef.current.timestamp < doubleTapDelay &&
            Math.abs(touchEnd.x - lastTapRef.current.x) < 20 &&
            Math.abs(touchEnd.y - lastTapRef.current.y) < 20) {
          // 双击
          if (onDoubleTap) {
            onDoubleTap(touchEnd);
          }
          lastTapRef.current = null;
        } else {
          // 单击
          if (onTap) {
            onTap(touchEnd);
          }
          lastTapRef.current = touchEnd;
          
          // 清除双击检测
          setTimeout(() => {
            if (lastTapRef.current === touchEnd) {
              lastTapRef.current = null;
            }
          }, doubleTapDelay);
        }
      }
    }

    // 重置状态
    touchStartRef.current = null;
    initialDistanceRef.current = 0;
    initialCenterRef.current = null;
  }, [
    getTouchPoint, 
    getSwipeDirection, 
    onSwipe, 
    onTap, 
    onDoubleTap, 
    swipeThreshold, 
    doubleTapDelay, 
    preventDefault,
    clearLongPressTimer
  ]);

  // 绑定事件监听器
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault, clearLongPressTimer]);

  return {
    ref: elementRef,
    isTouch: 'ontouchstart' in window
  };
};