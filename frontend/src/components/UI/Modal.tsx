import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    if (isOpen) {
      if (!dialogNode.open) {
        dialogNode.showModal();
      }
    } else {
      if (dialogNode.open) {
        dialogNode.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (!dialogNode) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialogNode.addEventListener('cancel', handleCancel);
    return () => {
      dialogNode.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      style={{
        margin: 'auto',
        border: '1px solid var(--surface-border)',
        borderRadius: '16px',
        padding: '24px',
        background: 'var(--bg-color)',
        color: 'var(--text-primary)',
        maxWidth: '500px',
        width: 'calc(100% - 32px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        outline: 'none',
      }}
      aria-labelledby="modal-title"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div>{children}</div>
    </dialog>
  );
};
