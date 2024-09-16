import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase'; 

const ProfileScreen = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUserData = async () => {
    setIsLoading(true);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData?.user) {
      console.error('Error fetching authenticated user:', authError);
      setErrorMessage('Korisnik nije ulogiran.');
      router.push('/login');
    } else {
      const userId = authData.user.id;
      const { data, error: userError } = await supabase
        .from('users')
        .select('username, email')
        .eq('id', userId)
        .single();
  
      if (userError) {
        console.error('Error fetching user data from users table:', userError);
        setErrorMessage('Greška pri dohvaćanju podataka korisnika.');
      } else {
        setUserData(data);
      }
    }
    setIsLoading(false); 
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Učitavanje podataka...</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Pressable style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Natrag na prijavu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {userData ? (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Username: {userData.username}</Text>
            <Text style={styles.infoText}>Email: {userData.email}</Text>
          </View>
          <Pressable onPress={() => router.push('/transactions')}>
            <Text style={styles.linkText}>Vaše transakcije</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.text}>Podaci o korisniku nisu dostupni.</Text>
      )}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Odjava</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    color: '#004d40',
    textAlign: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    alignSelf: 'flex-start',  
    marginBottom: 30,
  },
  infoText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 18,
    color: '#004d40', 
    textAlign: 'left',
    marginBottom: 30,
  },
  logoutButton: {
    alignSelf: 'flex-start',  
    marginTop: 10,  
    backgroundColor: '#2F4F4F',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default ProfileScreen;
