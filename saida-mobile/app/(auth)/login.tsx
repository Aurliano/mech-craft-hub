/**
 * Login screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useLogin } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { refetchUser } = useAuth();
  const loginMutation = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('لطفا نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    setError('');
    try {
      await loginMutation.mutateAsync({ username, password });
      await refetchUser();
      // Navigation will be handled by AppNavigator based on auth state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ورود به سیستم');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <Text style={styles.title}>ورود به حساب کاربری</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="نام کاربری"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="نام کاربری خود را وارد کنید"
            />
            <Input
              label="رمز عبور"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="رمز عبور خود را وارد کنید"
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
              title="ورود"
              onPress={handleLogin}
              loading={loginMutation.isPending}
              fullWidth
              style={styles.button}
            />
            <Button
              title="ثبت نام"
              onPress={() => navigation.navigate('Register' as never)}
              variant="outline"
              fullWidth
              style={styles.button}
            />
            <Button
              title="بازگشت"
              onPress={() => navigation.goBack()}
              variant="ghost"
              fullWidth
            />
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.foreground,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  button: {
    marginTop: spacing.md,
  },
});

