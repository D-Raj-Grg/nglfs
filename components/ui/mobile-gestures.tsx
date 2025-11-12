"use client";

import { ReactNode, useRef, useState, TouchEvent } from "react";
import { cn } from "@/lib/utils";

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
  threshold?: number;
}

/**
 * Swipe-to-delete mobile gesture component
 * Swipe left to reveal delete action
 */
export function SwipeToDelete({
  children,
  onDelete,
  className,
  threshold = 100,
}: SwipeToDeleteProps) {
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!swiping) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const distance = touchStart - currentTouch;

    // Only allow left swipe (positive distance)
    if (distance > 0 && distance <= threshold * 1.5) {
      setSwipeDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    const distance = touchStart - touchEnd;

    // If swiped past threshold, trigger delete
    if (distance > threshold) {
      onDelete();
    }

    // Reset position
    setSwipeDistance(0);
  };

  return (
    <div
      className={cn("relative overflow-hidden touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Delete background indicator */}
      {swipeDistance > 0 && (
        <div
          className="absolute inset-0 bg-linear-to-l from-red-500/20 to-transparent flex items-center justify-end pr-6 z-0"
          style={{
            opacity: Math.min(swipeDistance / threshold, 1),
          }}
        >
          <span className="text-red-500 font-medium text-sm">
            {swipeDistance > threshold ? "Release to delete" : "Swipe to delete"}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className="relative z-10 transition-transform"
        style={{
          transform: swiping ? `translateX(-${swipeDistance}px)` : "translateX(0)",
          transition: swiping ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
}

/**
 * Pull-to-refresh mobile gesture component
 * Pull down from top to trigger refresh
 */
export function PullToRefresh({
  children,
  onRefresh,
  className,
  threshold = 80,
}: PullToRefreshProps) {
  const [touchStart, setTouchStart] = useState<number>(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    // Only allow pull-to-refresh if at the top of the scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setTouchStart(e.targetTouches[0].clientY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!pulling || refreshing) return;

    const currentTouch = e.targetTouches[0].clientY;
    const distance = currentTouch - touchStart;

    // Only allow downward pull (positive distance)
    if (distance > 0 && distance <= threshold * 1.5) {
      setPullDistance(distance);
      // Prevent default scroll when pulling
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    setPulling(false);

    // If pulled past threshold, trigger refresh
    if (pullDistance > threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Reset position
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto touch-pan-x", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all z-50 bg-linear-to-b from-purple-500/10 to-transparent"
        style={{
          height: `${pullDistance}px`,
          opacity: Math.min(pullDistance / threshold, 1),
        }}
      >
        {refreshing ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
        ) : (
          <span className="text-purple-500 font-medium text-sm">
            {pullDistance > threshold ? "Release to refresh" : "Pull to refresh"}
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: pulling || refreshing ? `translateY(${pullDistance}px)` : "translateY(0)",
          transition: pulling ? "none" : "transform 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Long press gesture component
 * Trigger action on long press (mobile-friendly)
 */
interface LongPressProps {
  children: ReactNode;
  onLongPress: () => void;
  className?: string;
  duration?: number;
}

export function LongPress({
  children,
  onLongPress,
  className,
  duration = 500,
}: LongPressProps) {
  const [pressing, setPressing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    setPressing(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setPressing(false);
    }, duration);
  };

  const handleEnd = () => {
    setPressing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return (
    <div
      className={cn("select-none", className)}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchMove={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {children}
      {pressing && (
        <div className="absolute inset-0 bg-purple-500/10 rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
}
