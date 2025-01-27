import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface AuthInputProps extends TextInputProps {
  isPassword?: boolean;
}

export default function AuthInput({
  isPassword,
  style,
  ...props
}: AuthInputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      autoCapitalize="none"
      secureTextEntry={isPassword}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
});
