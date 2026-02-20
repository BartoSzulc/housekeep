import { Alert as RNAlert, Platform } from 'react-native';

export const alert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    RNAlert.alert(title, message);
  }
};

export const confirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  } else {
    RNAlert.alert(title, message, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'OK', onPress: onConfirm },
    ]);
  }
};
