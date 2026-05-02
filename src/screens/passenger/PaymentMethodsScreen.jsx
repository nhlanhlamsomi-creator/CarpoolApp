import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  StatusBar, Platform, Alert, ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme';

const IconChevronLeft = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const IconPlus = ({ size = 20, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);
const IconCard = ({ size = 28, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 8h20M2 12h8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" stroke={color} strokeWidth="1.8" fill="none" />
  </Svg>
);
const IconTrash = ({ size = 18, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const CARD_COLORS = ['#1a1a2e', '#7C3AED', '#0369A1', '#065F46'];

export default function PaymentMethodsScreen({ navigation }) {
  const [cards, setCards] = useState([
    { id: '1', last4: '4242', brand: 'Visa', expiry: '12/26', color: CARD_COLORS[0], isDefault: true },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleAddCard = async () => {
    const digits = newCard.number.replace(/\s/g, '');
    if (digits.length < 16) { Alert.alert('Invalid', 'Enter a valid 16-digit card number.'); return; }
    if (newCard.expiry.length < 5) { Alert.alert('Invalid', 'Enter a valid expiry date.'); return; }
    if (newCard.cvv.length < 3) { Alert.alert('Invalid', 'Enter a valid CVV.'); return; }
    if (!newCard.name.trim()) { Alert.alert('Invalid', 'Enter the cardholder name.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const newEntry = {
      id: Date.now().toString(),
      last4: digits.slice(-4),
      brand: digits[0] === '4' ? 'Visa' : digits[0] === '5' ? 'Mastercard' : 'Card',
      expiry: newCard.expiry,
      color: CARD_COLORS[cards.length % CARD_COLORS.length],
      isDefault: cards.length === 0,
    };
    setCards(p => [...p, newEntry]);
    setNewCard({ number: '', expiry: '', cvv: '', name: '' });
    setShowAdd(false);
    setLoading(false);
    Alert.alert('Card Added!', 'Your payment method has been saved.');
  };

  const handleDelete = (id) => {
    Alert.alert('Remove Card', 'Remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setCards(p => p.filter(c => c.id !== id)) },
    ]);
  };

  const handleSetDefault = (id) => {
    setCards(p => p.map(c => ({ ...c, isDefault: c.id === id })));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <IconChevronLeft size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(s => !s)} activeOpacity={0.8}>
          <IconPlus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Saved cards */}
        {cards.length === 0 && (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}><IconCard size={36} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptySub}>Add a card to pay for your rides easily.</Text>
          </View>
        )}

        {cards.map(card => (
          <View key={card.id} style={[styles.cardVisual, { backgroundColor: card.color }]}>
            <View style={styles.cardTop}>
              <Text style={styles.cardBrand}>{card.brand}</Text>
              {card.isDefault && (
                <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>
              )}
            </View>
            <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardMeta}>EXPIRES</Text>
                <Text style={styles.cardMetaVal}>{card.expiry}</Text>
              </View>
              <View style={styles.cardActions}>
                {!card.isDefault && (
                  <TouchableOpacity style={styles.cardActionBtn} onPress={() => handleSetDefault(card.id)} activeOpacity={0.7}>
                    <Text style={styles.cardActionText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cardDeleteBtn} onPress={() => handleDelete(card.id)} activeOpacity={0.7}>
                  <IconTrash size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Add card form */}
        {showAdd && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>Add New Card</Text>

            <Text style={styles.fLabel}>Card Number</Text>
            <TextInput
              style={styles.fInput}
              value={newCard.number}
              onChangeText={v => setNewCard(p => ({ ...p, number: formatCardNumber(v) }))}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#C0C0C0"
              keyboardType="number-pad"
              maxLength={19}
            />

            <View style={styles.fRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fLabel}>Expiry</Text>
                <TextInput
                  style={styles.fInput}
                  value={newCard.expiry}
                  onChangeText={v => setNewCard(p => ({ ...p, expiry: formatExpiry(v) }))}
                  placeholder="MM/YY"
                  placeholderTextColor="#C0C0C0"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fLabel}>CVV</Text>
                <TextInput
                  style={styles.fInput}
                  value={newCard.cvv}
                  onChangeText={v => setNewCard(p => ({ ...p, cvv: v.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="•••"
                  placeholderTextColor="#C0C0C0"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>

            <Text style={styles.fLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.fInput}
              value={newCard.name}
              onChangeText={v => setNewCard(p => ({ ...p, name: v }))}
              placeholder="e.g. SIPHO DLAMINI"
              placeholderTextColor="#C0C0C0"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={[styles.addCardBtn, loading && { opacity: 0.6 }]}
              onPress={handleAddCard}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.addCardBtnText}>{loading ? 'Adding…' : 'Add Card'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: '#fff' },
  addBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: 20, paddingBottom: 48 },
  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  emptySub: { fontSize: 13.5, color: '#999', textAlign: 'center' },
  // Card visual
  cardVisual: {
    borderRadius: 20, padding: 22, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  cardBrand: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  defaultBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  cardNumber: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: 3, marginBottom: 20 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardMeta: { fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, textTransform: 'uppercase' },
  cardMetaVal: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cardActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  cardActionText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  cardDeleteBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  // Add form
  addForm: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  addFormTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 18 },
  fLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 },
  fInput: {
    fontSize: 16, color: '#1a1a2e', backgroundColor: '#F7F8FA',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16,
  },
  fRow: { flexDirection: 'row' },
  addCardBtn: {
    height: 52, backgroundColor: colors.primary, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 12,
  },
  addCardBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelBtnText: { color: '#999', fontSize: 14, fontWeight: '600' },
});