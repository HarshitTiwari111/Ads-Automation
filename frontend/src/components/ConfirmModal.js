import React from 'react';

const ConfirmModal = ({ show, title, message, confirmText, cancelText, onConfirm, onCancel, danger }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title || 'Are you sure?'}</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.5 }}>
          {message || 'This action cannot be undone.'}
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText || 'Cancel'}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
