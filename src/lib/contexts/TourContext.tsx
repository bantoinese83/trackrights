/**
 * Tour Context
 * Manages tour guide state to avoid prop drilling
 * Includes persistence, completion tracking, and restart functionality
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

const TOUR_STORAGE_KEY = 'trackrights_tour_completed';
const TOUR_VERSION = '1.0'; // Increment to reset tours for all users

interface TourContextType {
  isTourOpen: boolean;
  hasCompletedTour: boolean;
  openTour: () => void;
  closeTour: () => void;
  restartTour: () => void;
  completeTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  // Load tour completion status from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Check if tour version matches (allows resetting tours)
        if (data.version === TOUR_VERSION && data.completed === true) {
          setHasCompletedTour(true);
        }
      }
    } catch (error) {
      console.error('Error reading tour completion status:', error);
      // If there's an error, assume tour hasn't been completed
      setHasCompletedTour(false);
    }
  }, []);

  const openTour = useCallback(() => {
    setIsTourOpen(true);
    // Prevent body scroll when tour is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    // Restore body scroll
    document.body.style.overflow = '';
  }, []);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(
        TOUR_STORAGE_KEY,
        JSON.stringify({
          completed: true,
          version: TOUR_VERSION,
          completedAt: new Date().toISOString(),
        })
      );
      setHasCompletedTour(true);
      closeTour();
    } catch (error) {
      console.error('Error saving tour completion status:', error);
      // Still close the tour even if localStorage fails
      closeTour();
    }
  }, [closeTour]);

  const restartTour = useCallback(() => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      setHasCompletedTour(false);
      openTour();
    } catch (error) {
      console.error('Error resetting tour:', error);
      // Still open the tour even if localStorage fails
      openTour();
    }
  }, [openTour]);

  // Cleanup: restore body scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <TourContext.Provider
      value={{
        isTourOpen,
        hasCompletedTour,
        openTour,
        closeTour,
        completeTour,
        restartTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
