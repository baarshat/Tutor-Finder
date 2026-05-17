import React from 'react';
import './ConfirmationModal.css';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', type = 'primary' }) {
  if (!isOpen) return null;

  return (
    <div className="sa-modal__overlay" onClick={onClose}>
      <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="sa-modal__title">{title}</h2>
        <p className="sa-modal__message">{message}</p>
        <div className="sa-modal__actions">
          <button className="sa-modal__cancel" onClick={onClose}>Cancel</button>
          <button className={`sa-modal__confirm sa-modal__confirm--${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
