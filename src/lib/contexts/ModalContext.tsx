/**
 * Modal Context
 * Manages modal state to avoid prop drilling
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Contract } from '@/lib/contracts';

interface ModalState {
  selectedContract: Contract | null;
  isOpen: boolean;
}

interface ModalContextType {
  modalState: ModalState;
  openModal: (contract: Contract) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modalState, setModalState] = useState<ModalState>({
    selectedContract: null,
    isOpen: false,
  });

  const openModal = (contract: Contract) => {
    setModalState({
      selectedContract: contract,
      isOpen: true,
    });
  };

  const closeModal = () => {
    setModalState({
      selectedContract: null,
      isOpen: false,
    });
  };

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
