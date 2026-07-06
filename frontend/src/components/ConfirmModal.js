import React from 'react';

const ConfirmModal = ({ show, title, message, confirmText, cancelText, onConfirm, onCancel, danger }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: 18 }}>{title || 'Are you sure?'}</h2>
        <p style={{ color: '#6b7280', margin: '12px 0 24px', lineHeight: 1.5 }}>
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
