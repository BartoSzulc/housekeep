import React, { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useZxing } from 'react-zxing';
import { Colors } from '../constants/colors';

interface Props {
  onScanned: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerView({ onScanned, onClose }: Props) {
  const handleDecodeResult = useCallback(
    (result: any) => {
      if (result) {
        onScanned(result.getText());
      }
    },
    [onScanned],
  );

  const { ref } = useZxing({
    onDecodeResult: handleDecodeResult,
    timeBetweenDecodingAttempts: 300,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Zamknij</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <video
          ref={ref as any}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Skieruj kamerę na kod kreskowy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 160,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
});
