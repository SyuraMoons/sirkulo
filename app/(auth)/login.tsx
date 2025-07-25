import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function LoginScreen() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (step === 1 && email) {
      setStep(2);
    } else if (step === 2 && password) {
      // Handle login logic here
      router.replace('/(tabs)');
    }
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
          />
          <TouchableOpacity style={styles.mainButton} onPress={handleContinue}>
            <Text style={styles.mainButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/regist')}>
            <Text style={styles.linkText}>
              Don't have an Account? <Text style={styles.linkTextBold}>Create One</Text>
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.mainButton} onPress={handleContinue}>
            <Text style={styles.mainButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              // Handle forgot password
              alert('Password reset functionality would be implemented here');
            }}
          >
            <Text style={styles.linkText}>
              Forgot Password? <Text style={styles.linkTextBold}>Reset</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="apple" size={24} color="#000" />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={24} color="#DB4437" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
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
