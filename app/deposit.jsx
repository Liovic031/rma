import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import { supabase } from '../supabase';  
import { useRouter } from 'expo-router';

const DepositScreen = () => {
  const [amount, setAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Dohvati korisnika
  const fetchUser = async () => {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMessage('Korisnik nije ulogiran.');
      return;
    }
    setUserId(user.user.id);  
  };

  
  // Dohvati kartice
const fetchCards = async () => {
  if (!userId) return;

  const { data: cardsData, error: cardsError } = await supabase
    .from('cards')
    .select('id, card_holder_name, card_number, expiry_date')
    .eq('user_id', userId);

  if (cardsError) {
    setErrorMessage('Greška pri dohvaćanju kartica.');
  } else {
    console.log('Dohvaćene kartice: ', cardsData);  
    setCards(cardsData);
  }
};


  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCards();
    }
  }, [userId]);

  const handleDeposit = async () => {
    const amountValue = parseFloat(amount);

    if (!selectedCard) {
      setErrorMessage('Odaberite karticu.');
      return;
    }

    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage('Unesite ispravan iznos.');
      return;
    }

    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userDataError) {
      setErrorMessage('Greška pri dohvaćanju balansa.');
      return;
    }

    const newBalance = userData.balance + amountValue;

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      setErrorMessage('Greška pri ažuriranju balansa.');
    } else {
      Alert.alert('Uspješno!', 'Iznos je dodan na račun.');
      setAmount(''); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TextInput
        placeholder="Amount (€)"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      {/* Prikaz kartica */}
      {cards.length > 0 ? (
        cards.map((card) => (
          <Pressable
            key={card.id}
            style={[
              styles.card,
              selectedCard === card.id ? styles.selectedCard : null,  
            ]}
            onPress={() => setSelectedCard(card.id)} 
          >
            <Text>{card.card_holder_name} - **** {card.card_number.slice(-4)} - Expiry: {new Date(card.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</Text>
          </Pressable>
        ))) : (<Text>Nema dostupnih kartica.</Text>)
      }
      <Pressable style={styles.button} onPress={handleDeposit}>
        <Text style={styles.buttonText}>Confirm</Text>
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
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedCard: {
    borderColor: '#004d40',  
    backgroundColor: '#e8f5e9',
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
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default DepositScreen;
