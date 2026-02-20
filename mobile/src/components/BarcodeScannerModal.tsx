import React from 'react';
import { Modal } from 'react-native';
import BarcodeScannerView from './BarcodeScannerView';

interface Props {
  visible: boolean;
  onScanned: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerModal({ visible, onScanned, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <BarcodeScannerView onScanned={onScanned} onClose={onClose} />
    </Modal>
  );
}
