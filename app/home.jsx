import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '../supabase';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = () => {
  const [balance, setBalance] = useState(null); 
  const [loading, setLoading] = useState(true);  
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const fetchUserBalance = async () => {
    setLoading(true);  
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setErrorMessage('Greška pri dohvaćanju korisnika.');
      setLoading(false);
      return;
    }

    const userId = data.user.id;

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userDataError) {
      setErrorMessage('Greška pri dohvaćanju balansa.');
    } else {
      console.log("Dohvaćen balans: ", userData.balance); 
      setBalance(userData.balance);  
    }
    setLoading(false);  
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserBalance();  
    }, [])
  );
  
  useEffect(() => {
    fetchUserBalance();  
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.balanceContainer}>
        {loading ? (  
          <ActivityIndicator size="large" color="#fff" />
        ) : errorMessage ? (  
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (  
          <Text style={styles.balance}>{balance.toFixed(2)} EUR</Text>
        )}
      </View>
      
      <View style={styles.menu}>
        <Pressable style={styles.menuButton} onPress={() => router.push('/deposit')}>
          <Icon name="arrow-circle-down" size={20} color="#004d40" />
          <Text style={styles.menuButtonText}>Deposit</Text>
        </Pressable>
        <Pressable style={styles.menuButton} onPress={() => router.push('/withdrawal')}>
          <Icon name="arrow-circle-up" size={20} color="#004d40" />
          <Text style={styles.menuButtonText}>Withdrawal</Text>
        </Pressable>
        <Pressable style={styles.menuButton} onPress={() => router.push('/send')}>
          <Icon name="paper-plane" size={20} color="#004d40" />
          <Text style={styles.menuButtonText}>Send</Text>
        </Pressable>
        <Pressable style={styles.menuButton} onPress={() => router.push('/cards')}>
          <Icon name="credit-card" size={20} color="#004d40" />
          <Text style={styles.menuButtonText}>Cards</Text>
        </Pressable>
      </View>   
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
      },
      balanceContainer: {
        backgroundColor: '#004d40',
        padding: 30,  
        borderRadius: 15,
        marginBottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
      },
      balance: {
        fontSize: 50,  
        color: '#fff',
      },
      menu: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 80,  
      },
      menuButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 30,  
        paddingHorizontal: 20,
        width: '45%',
        marginVertical: 15,
        borderRadius: 12,  
        alignItems: 'center',
      },
      menuButtonText: {
        color: '#004d40',  
        fontSize: 18, 
        marginTop: 10,  
      },
      errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
      },
});

export default HomeScreen;
