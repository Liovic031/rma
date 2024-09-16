import { StatusBar } from 'expo-status-bar';
import { useRouter, Stack } from 'expo-router';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';

export default function App() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/cashflow.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Welcome to CashFlow</Text>
      {/* Gumb za Login */}
      <Pressable style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      {/* Gumb za Register */}
      <Pressable style={styles.button} onPress={() => router.push('/register')}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004d40', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#ffffff', 
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2F4F4F', 
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});
