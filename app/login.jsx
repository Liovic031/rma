import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../supabase';  

const LoginScreen = () => {
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorMessage('Greška pri prijavi: ' + error.message);
      setLoading(false);
    } else {
      const userId = data.user.id;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username, balance, role')
        .eq('id', userId)
        .single();  

      if (userError) {
        setErrorMessage('Greška pri dohvaćanju korisničkih podataka: ' + userError.message);
      } else {
        console.log('Logged in as:', userData);
        router.push('/home');
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/cashflow.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Prijava...' : 'Confirm'}</Text>
      </Pressable>
      <Text style={styles.signupText}>
        Don't have an account?{' '}
        <Text style={styles.signupLink} onPress={() => router.push('/register')}> Sign up</Text>
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
  signupText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  signupLink: {
    color: '#004d40',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
