import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../supabase';  

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUser = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage('Korisnik nije ulogiran.');
      return;
    }
    setUserId(user.user.id);
  };


  const fetchTransactions = async () => {
    if (!userId) return;
  
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('sender_id, receiver_id, amount, message')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  
    if (transactionsError) {
      setErrorMessage('Greška pri dohvaćanju transakcija.');
      return;
    }
  
    const enrichedTransactions = await Promise.all(
      transactionsData.map(async (transaction) => {
        const { data: senderData, error: senderError } = await supabase
          .from('users')
          .select('username')
          .eq('id', transaction.sender_id)
          .single();
  
        const { data: receiverData, error: receiverError } = await supabase
          .from('users')
          .select('username')
          .eq('id', transaction.receiver_id)
          .single();
  
        if (senderError || receiverError) {
          setErrorMessage('Greška pri dohvaćanju korisničkih imena.');
          return { ...transaction, sender_username: 'Unknown', receiver_username: 'Unknown' };
        }
  
        return {
          ...transaction,
          sender_username: senderData?.username || 'Unknown',
          receiver_username: receiverData?.username || 'Unknown',
        };
      })
    );
  
    setTransactions(enrichedTransactions);
  };
  
  useEffect(() => {
    fetchUser();  
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();  
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {transactions.length > 0 ? (
        transactions.map((transaction, index) => (
          <View
            key={index}
            style={[
              styles.transaction,
              transaction.receiver_id === userId ? styles.received : styles.sent, 
            ]}
          >
            <Text style={styles.text}>
              {transaction.receiver_id === userId ? 'Received from' : 'Sent to'}{' '}
              {transaction.receiver_id === userId ? transaction.sender_username : transaction.receiver_username}
              - €{transaction.amount}
            </Text>
            <Text style={styles.commentText}>Message: {transaction.message || 'No message'}</Text>
          </View>
        ))
      ) : (<Text>No transactions available.</Text>)
      }
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
    fontSize: 24,
    color: '#004d40',
    marginBottom: 20,
    textAlign: 'center',
  },
  transaction: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  received: {
    backgroundColor: '#e8f5e9',  
  },
  sent: {
    backgroundColor: '#ffebee', 
  },
  text: {
    color: '#004d40',
  },
  commentText: {
    color: '#555',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default TransactionsScreen;
