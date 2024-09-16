import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { supabase } from '../supabase';  
import { useRouter } from 'expo-router';

const SendScreen = () => {
  const [username, setUsername] = useState('');  
  const [amount, setAmount] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [userId, setUserId] = useState(null);  
  const [senderBalance, setSenderBalance] = useState(0);  
  const [errorMessage, setErrorMessage] = useState(''); 
  const router = useRouter();

  const fetchUser = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage('Korisnik nije ulogiran.');
      return;
    }
    setUserId(user.user.id); 

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user.user.id)
      .single();

    if (userDataError) {
      setErrorMessage('Greška pri dohvaćanju balansa.');
    } else {
      setSenderBalance(userData.balance);
    }
  };

  const findReceiver = async () => {
    const { data: receiverData, error: receiverError } = await supabase
      .from('users')
      .select('id, balance')
      .eq('username', username)
      .single();

    if (receiverError || !receiverData) {
      setErrorMessage('Primatelj s unesenim korisničkim imenom ne postoji.');
      return null;
    }
    return receiverData;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSendMoney = async () => {
    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage('Unesite ispravan iznos.');
      return;
    }

    if (senderBalance < amountValue) {
      setErrorMessage('Nedovoljno sredstava za slanje.');
      return;
    }

    const receiver = await findReceiver();
    if (!receiver) return;  

    const newSenderBalance = senderBalance - amountValue;
    const newReceiverBalance = receiver.balance + amountValue;

    const { error: updateSenderError } = await supabase
      .from('users')
      .update({ balance: newSenderBalance })
      .eq('id', userId);

    if (updateSenderError) {
      setErrorMessage('Greška pri ažuriranju stanja korisnika koji šalje.');
      return;
    }

    const { error: updateReceiverError } = await supabase
      .from('users')
      .update({ balance: newReceiverBalance })
      .eq('id', receiver.id);

    if (updateReceiverError) {
      setErrorMessage('Greška pri ažuriranju stanja primatelja.');
      return;
    }

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        sender_id: userId,
        receiver_id: receiver.id,
        amount: amountValue,
        message,
      });

    if (transactionError) {
      setErrorMessage('Greška pri zapisivanju transakcije.');
    } else {
      Alert.alert('Uspješno!', 'Novac je uspješno poslan.');
      setAmount('');  
      setUsername('');  
      setMessage('');  
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Money</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TextInput
        placeholder="Recipient's Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Amount (€)"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Message (optional)"
        style={styles.input}
        value={message}
        onChangeText={setMessage}
      />
      <Pressable style={styles.button} onPress={handleSendMoney}>
        <Text style={styles.buttonText}>Send</Text>
      </Pressable>
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
  title: {
    fontSize: 24,
    color: '#004d40',
    marginBottom: 20,
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
});

export default SendScreen;
