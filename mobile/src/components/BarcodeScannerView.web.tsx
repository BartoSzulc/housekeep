import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  onScanned: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScannerView({ onScanned, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onScannedRef = useRef(onScanned);
  onScannedRef.current = onScanned;
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let animFrame: number;
    let zxingControls: { stop: () => void } | null = null;

    async function acquireCamera(): Promise<MediaStream | null> {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        try {
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch {
          return null;
        }
      }
    }

    async function start() {
      const video = videoRef.current;
      if (!video) return;

      const hasBarcodeDetector = 'BarcodeDetector' in window;

      if (hasBarcodeDetector) {
        // Native BarcodeDetector — fast and reliable on Chrome/Edge/Android
        stream = await acquireCamera();
        if (!stream) {
          if (!cancelled) setError('Nie udało się uruchomić kamery.');
          return;
        }
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();
        setScanning(true);

        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
        });

        const detectLoop = async () => {
          if (cancelled || !video || video.readyState < 2) {
            if (!cancelled) animFrame = requestAnimationFrame(detectLoop);
            return;
          }
          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0 && !cancelled) {
              const code = barcodes[0].rawValue;
              if (code && code.length >= 8) {
                setScanned(true);
                stream?.getTracks().forEach((t) => t.stop());
                onScannedRef.current(code);
                return;
              }
            }
          } catch {
            // detect() can fail on some frames, just continue
          }
          if (!cancelled) animFrame = requestAnimationFrame(detectLoop);
        };

        animFrame = requestAnimationFrame(detectLoop);
      } else {
        // Fallback: use @zxing/library for browsers without BarcodeDetector (Firefox, Safari)
        try {
          const { BrowserMultiFormatReader } = await import('@zxing/library');
          const codeReader = new BrowserMultiFormatReader();

          if (cancelled) return;

          const controls = await codeReader.decodeFromConstraints(
            { video: { facingMode: { ideal: 'environment' } } },
            video,
            (result: any) => {
              if (result && !cancelled) {
                const text = result.getText();
                if (text && text.length >= 8) {
                  setScanned(true);
                  zxingControls?.stop();
                  onScannedRef.current(text);
                }
              }
            },
          );

          zxingControls = controls;

          if (cancelled) {
            controls.stop();
            return;
          }
          setScanning(true);
        } catch {
          if (!cancelled) setError('Skaner niedostępny w tej przeglądarce.');
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (animFrame) cancelAnimationFrame(animFrame);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (zxingControls) zxingControls.stop();
      // Extra safety: stop any stream still attached to the video element
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Zamknij</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Zamknij</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          playsInline
          muted
        />
        <View style={styles.overlay}>
          <View style={[styles.scanFrame, scanning && styles.scanFrameActive]} />
        </View>
      </View>

      <View style={styles.footer}>
        {scanned ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.hint}>  Odczytano! Szukam...</Text>
          </View>
        ) : scanning ? (
          <Text style={styles.hint}>Skieruj kamerę na kod kreskowy</Text>
        ) : (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.hint}>  Uruchamianie kamery...</Text>
          </View>
        )}
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
    borderColor: 'rgba(72, 199, 142, 0.3)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanFrameActive: {
    borderColor: Colors.secondary,
    borderWidth: 3,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
});
