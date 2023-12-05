import React from 'react';

export default function CreateProposalModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div>
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  );
}
