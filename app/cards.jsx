import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../supabase';
import { useRouter } from 'expo-router';

const CardsScreen = () => {
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCVC] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cards, setCards] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      setErrorMessage('Korisnik nije ulogiran.');
      setUserId(null);
    } else {
      setUserId(data.user.id);
      setErrorMessage('');
    }
  };

  useEffect(() => {
    fetchUser();
    if (userId) {
      fetchCards();
    }
  }, [userId]);

  const fetchCards = async () => {
    if (!userId) {
      return;
    }
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('id, card_holder_name, card_number, expiry_date')
      .eq('user_id', userId);

    if (cardsError) {
      setErrorMessage('Greška pri dohvaćanju kartica: ' + cardsError.message);
    } else {
      setCards(cardsData);
    }
  };

  const handleAddCard = async () => {
    if (!userId) {
      setErrorMessage('Korisnik nije ulogiran.');
      return;
    }

    if (cardNumber.length !== 16 || cvc.length !== 3) {
      setErrorMessage('Broj kartice mora imati 16 znamenki, a CVC 3 znamenke.');
      return;
    }

    const expiryDate = new Date(`${expiryYear}-${expiryMonth}-01`);
    if (expiryDate <= new Date()) {
      setErrorMessage('Datum isteka mora biti u budućnosti.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('cards')
      .insert({
        user_id: userId,
        card_holder_name: cardHolderName,
        card_number: cardNumber,
        cvc,
        expiry_date: expiryDate,
      });

    if (error) {
      setErrorMessage('Greška pri dodavanju kartice: ' + error.message);
    } else {
      setErrorMessage('');
      fetchCards();
    }

    setLoading(false);
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Text>Name: {item.card_holder_name}</Text>
      <Text>Number: **** **** **** {item.card_number.slice(-4)}</Text>
      <Text>Expiry: {new Date(item.expiry_date).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Card</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <TextInput
        placeholder="Name on Card"
        style={styles.input}
        value={cardHolderName}
        onChangeText={setCardHolderName}
      />
      <TextInput
        placeholder="Card Number"
        style={styles.input}
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        maxLength={16}
      />
      <TextInput
        placeholder="CVC"
        style={styles.input}
        value={cvc}
        onChangeText={setCVC}
        keyboardType="numeric"
        maxLength={3}
      />
      <TextInput
        placeholder="Expiry Month (MM)"
        style={styles.input}
        value={expiryMonth}
        onChangeText={setExpiryMonth}
        keyboardType="numeric"
        maxLength={2}
      />
      <TextInput
        placeholder="Expiry Year (YYYY)"
        style={styles.input}
        value={expiryYear}
        onChangeText={setExpiryYear}
        keyboardType="numeric"
        maxLength={4}
      />
      <Pressable style={styles.button} onPress={handleAddCard} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Card'}</Text>
      </Pressable>

      <Text style={styles.title}>Your Cards</Text>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        ListEmptyComponent={<Text>No cards available.</Text>}
      />
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
    marginBottom: 20,
    color: '#004d40',
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
    marginBottom: 20,
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
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});

export default CardsScreen;
