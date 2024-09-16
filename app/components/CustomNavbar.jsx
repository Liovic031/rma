// app/components/CustomNavbar.jsx
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; 

const CustomNavbar = () => {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <Pressable onPress={() => router.push('/transactions')}>
        <Icon name="swap-horizontal" size={30} color="#fff" />
      </Pressable>
      <Pressable style={styles.homeButton} onPress={() => router.push('/home')}>
        <Icon name="home" size={40} color="#004d40" />
      </Pressable>
      <Pressable onPress={() => router.push('/profile')}>
        <Icon name="person" size={30} color="#fff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#004d40', 
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  homeButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50, 
  },
});

export default CustomNavbar;
