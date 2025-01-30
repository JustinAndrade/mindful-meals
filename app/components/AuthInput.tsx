import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  autoComplete?: string;
  testID?: string;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  label?: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
}

export default function AuthInput({
  placeholder,
  value,
  onChangeText,
  autoComplete,
  testID,
  autoFocus,
  secureTextEntry,
  label,
  error,
  keyboardType = 'default',
  returnKeyType,
  onSubmitEditing,
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        value && styles.inputContainerFilled
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.35)"
          value={value}
          onChangeText={onChangeText}
          autoComplete={autoComplete as any}
          testID={testID}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          selectionColor="#007AFF"
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.secureButton}
            onPress={() => setIsSecureVisible(!isSecureVisible)}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-off' : 'eye'}
              size={20}
              color="rgba(0, 0, 0, 0.4)"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 8,
    letterSpacing: -0.24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 48,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputContainerFocused: {
    borderColor: '#007AFF',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputContainerError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  inputContainerFilled: {
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 12,
    letterSpacing: -0.3,
  },
  secureButton: {
    padding: 8,
    marginRight: -8,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 6,
    letterSpacing: -0.2,
  },
});
