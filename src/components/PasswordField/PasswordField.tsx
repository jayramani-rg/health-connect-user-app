import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TextField } from '../TextField/TextField';
import { styles } from './styles/PasswordField.styles';
import type { PasswordFieldProps, PasswordRuleState } from './types/PasswordField.types';

export function getPasswordRules(password: string): PasswordRuleState[] {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a letter', met: /[A-Za-z]/.test(password) },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a symbol (! @ # …)', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRules(password).every((rule) => rule.met);
}

export function PasswordField({ label, value, onChangeText, placeholder, errorText, showChecklist }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const rules = getPasswordRules(value);

  return (
    <View>
      <TextField
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        errorText={errorText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        suffix={
          <TouchableOpacity onPress={() => setVisible((v) => !v)}>
            <Text style={styles.toggle}>{visible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        }
      />
      {showChecklist && (
        <View style={styles.checklist}>
          {rules.map((rule) => (
            <View key={rule.label} style={styles.ruleRow}>
              <Text style={rule.met ? styles.ruleMarkMet : styles.ruleMarkUnmet}>{rule.met ? '✓' : '○'}</Text>
              <Text style={rule.met ? styles.ruleTextMet : styles.ruleTextUnmet}>{rule.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export type { PasswordFieldProps };
