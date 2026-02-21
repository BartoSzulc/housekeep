import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../constants/colors';

interface Props {
  onScanned: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerView({ onScanned, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = useCallback(
    ({ data }: { type: string; data: string }) => {
      if (scanned || !data || data.length < 8) return;
      setScanned(true);
      onScanned(data);
    },
    [scanned, onScanned],
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>Ładowanie...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Aby skanować kody kreskowe, potrzebujemy dostępu do kamery.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Zezwól na kamerę</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Anuluj</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Zamknij</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
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
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  permissionBox: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
