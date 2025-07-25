import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/src/contexts/AuthContext';

export default function LoginScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, state } = useAuth();

  const handleContinue = async () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && password) {
      setIsLoading(true);
      try {
        const success = await login(email, password);
        if (success) {
          router.replace('/(tabs)');
        } else {
          Alert.alert('Login Failed', state.error || 'Invalid credentials');
        }
      } catch (error) {
        Alert.alert('Login Failed', 'An error occurred during login');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password reset functionality will be implemented in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.mainButton, (!email || isLoading) && styles.disabledButton]} 
            onPress={handleContinue}
            disabled={!email || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => router.push('/(auth)/regist')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Don't have an Account? <Text style={styles.linkTextBold}>Create One</Text>
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.emailDisplay}>
            <Text style={styles.emailLabel}>Email</Text>
            <Text style={styles.emailValue}>{email}</Text>
            <TouchableOpacity onPress={() => setStep(1)} disabled={isLoading}>
              <Text style={styles.changeEmailText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
          
          <TouchableOpacity 
            style={[styles.mainButton, (!password || isLoading) && styles.disabledButton]} 
            onPress={handleContinue}
            disabled={!password || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Forgot Password? <Text style={styles.linkTextBold}>Reset</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
            <FontAwesome name="apple" size={24} color="#000" />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
            <FontAwesome name="google" size={24} color="#DB4437" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
            <FontAwesome name="facebook" size={24} color="#4267B2" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  mainButton: {
    backgroundColor: '#386B5F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginBottom: 32,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextBold: {
    color: '#386B5F',
    fontWeight: '600',
  },
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emailValue: {
    fontSize: 16,
    color: '#222',
    flex: 1,
    marginLeft: 8,
  },
  changeEmailText: {
    fontSize: 14,
    color: '#386B5F',
    fontWeight: '600',
  },
  socialButtons: {
    marginTop: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
    fontWeight: '500',
  },
});
