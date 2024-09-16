import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../supabase';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('Lozinke se ne podudaraju');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      setErrorMessage('Greška pri registraciji: ' + error.message);
    } else {
      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: username,
            password: password, 
            role: 'user', 
            balance: 0,   
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          setErrorMessage('Greška pri spremanju korisnika: ' + insertError.message);
          setLoading(false);
          return;
        }
      }
      alert('Uspješno registrirani');
      router.push('/home'); 
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/cashflow.png')} style={styles.logo} />
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Registracija...' : 'Register'}
        </Text>
      </Pressable>
      <Text style={styles.loginText}>
        Already have an account? <Text style={styles.loginLink} onPress={() => router.push('/login')}>Log in</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#004d40',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#004d40',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  loginLink: {
    color: '#004d40',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
