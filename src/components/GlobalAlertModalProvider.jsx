import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

function GlobalAlertModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: 'ยืนยันรายการ',
    message: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
  });
  const alertQueueRef = useRef([]);
  const isShowingRef = useRef(false);
  const confirmQueueRef = useRef([]);
  const isConfirmShowingRef = useRef(false);
  const activeConfirmRef = useRef(null);

  const showNextAlert = useCallback(() => {
    if (alertQueueRef.current.length === 0) {
      isShowingRef.current = false;
      setOpen(false);
      setMessage('');
      return;
    }

    const nextMessage = alertQueueRef.current.shift();
    setMessage(nextMessage);
    setOpen(true);
  }, []);

  const showNextConfirm = useCallback(() => {
    if (confirmQueueRef.current.length === 0) {
      isConfirmShowingRef.current = false;
      activeConfirmRef.current = null;
      setConfirmModal((prev) => ({
        ...prev,
        open: false,
        message: '',
      }));
      return;
    }

    const nextConfirm = confirmQueueRef.current.shift();
    activeConfirmRef.current = nextConfirm;
    setConfirmModal({
      open: true,
      title: nextConfirm.title || 'ยืนยันรายการ',
      message: nextConfirm.message || '',
      confirmText: nextConfirm.confirmText || 'ยืนยัน',
      cancelText: nextConfirm.cancelText || 'ยกเลิก',
    });
  }, []);

  useEffect(() => {
    const originalAlert = window.alert;
    const previousShowMuiConfirm = window.showMuiConfirm;

    window.alert = (incomingMessage = '') => {
      const normalizedMessage = typeof incomingMessage === 'string'
        ? incomingMessage
        : JSON.stringify(incomingMessage);

      alertQueueRef.current.push(normalizedMessage);

      if (!isShowingRef.current) {
        isShowingRef.current = true;
        showNextAlert();
      }
    };

    window.showMuiConfirm = (incomingMessage = '', options = {}) => {
      const normalizedMessage = typeof incomingMessage === 'string'
        ? incomingMessage
        : JSON.stringify(incomingMessage);

      return new Promise((resolve) => {
        confirmQueueRef.current.push({
          message: normalizedMessage,
          title: options.title,
          confirmText: options.confirmText,
          cancelText: options.cancelText,
          resolve,
        });

        if (!isConfirmShowingRef.current) {
          isConfirmShowingRef.current = true;
          showNextConfirm();
        }
      });
    };

    const logoutClickCapture = (event) => {
      const logoutElement = event.target?.closest?.('.logout-btn');
      if (!logoutElement) return;
      if (logoutElement.dataset?.skipLogoutConfirm === '1') return;

      event.preventDefault();
      event.stopPropagation();

      window
        .showMuiConfirm('คุณต้องการออกจากระบบใช่หรือไม่?', {
          title: 'ยืนยันการออกจากระบบ',
          confirmText: 'ออกจากระบบ',
          cancelText: 'ยกเลิก',
        })
        .then((confirmed) => {
          if (!confirmed) return;
          logoutElement.dataset.skipLogoutConfirm = '1';
          logoutElement.click();
          delete logoutElement.dataset.skipLogoutConfirm;
        });
    };

    document.addEventListener('click', logoutClickCapture, true);

    return () => {
      window.alert = originalAlert;
      window.showMuiConfirm = previousShowMuiConfirm;
      document.removeEventListener('click', logoutClickCapture, true);
    };
  }, [showNextAlert, showNextConfirm]);

  const handleClose = () => {
    showNextAlert();
  };

  const handleConfirmClose = () => {
    if (activeConfirmRef.current?.resolve) {
      activeConfirmRef.current.resolve(false);
    }
    showNextConfirm();
  };

  const handleConfirmAccept = () => {
    if (activeConfirmRef.current?.resolve) {
      activeConfirmRef.current.resolve(true);
    }
    showNextConfirm();
  };

  return (
    <>
      {children}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="global-alert-title"
        aria-describedby="global-alert-description"
      >
        <DialogTitle id="global-alert-title">แจ้งเตือน</DialogTitle>
        <DialogContent>
          <DialogContentText id="global-alert-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmModal.open}
        onClose={handleConfirmClose}
        aria-labelledby="global-confirm-title"
        aria-describedby="global-confirm-description"
      >
        <DialogTitle id="global-confirm-title">{confirmModal.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="global-confirm-description">
            {confirmModal.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>
            {confirmModal.cancelText}
          </Button>
          <Button color="error" onClick={handleConfirmAccept} autoFocus>
            {confirmModal.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default GlobalAlertModalProvider;