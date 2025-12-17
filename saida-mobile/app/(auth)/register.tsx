/**
 * Register screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import { useCustomerRegister } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useCustomerRegister();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.phone || !formData.password) {
      setError('لطفا تمام فیلدهای الزامی را پر کنید');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند');
      return;
    }

    setError('');
    try {
      await registerMutation.mutateAsync({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      // Navigate to login or phone verification
      router.push('/(auth)/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت نام');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <Text style={styles.title}>ثبت نام</Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="نام کاربری"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="ایمیل"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="شماره تلفن"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
            <Input
              label="نام"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />
            <Input
              label="نام خانوادگی"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />
            <Input
              label="رمز عبور"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
            <Input
              label="تکرار رمز عبور"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
              title="ثبت نام"
              onPress={handleRegister}
              loading={registerMutation.isPending}
              fullWidth
              style={styles.button}
            />
            <Button
              title="ورود"
              onPress={() => router.push('/(auth)/login')}
              variant="outline"
              fullWidth
              style={styles.button}
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
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
  },
  card: {
    width: '100%',
    marginTop: spacing.lg,
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

