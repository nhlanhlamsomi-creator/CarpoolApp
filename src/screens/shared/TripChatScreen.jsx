import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { MOCK_MESSAGES } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
}

export default function TripChatScreen({ navigation, route }) {
  const { tripRoute = 'Group Chat', driverName = 'Driver' } = route?.params || {};
  const { user } = useAuth();

  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [text, setText]         = useState('');
  const flatListRef             = useRef(null);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg = {
      id: 'msg_' + Date.now(),
      senderUid:   user.uid,
      senderName:  user.fullName,
      senderRole:  user.role,
      text:        trimmed,
      createdAt:   new Date(),
      readBy:      [user.uid],
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const isMe = (msg) => msg.senderUid === user?.uid;

  const renderMessage = ({ item, index }) => {
    const mine       = isMe(item);
    const isDriverMsg = item.senderRole === 'driver';
    const showName   = !mine && (index === 0 || messages[index - 1]?.senderUid !== item.senderUid);
    const showTime   = index === messages.length - 1 || messages[index + 1]?.senderUid !== item.senderUid;

    return (
      <View style={[styles.msgRow, mine && styles.msgRowMe]}>
        {!mine && showName && (
          <View style={[styles.avatar, isDriverMsg && styles.avatarDriver]}>
            <Text style={[styles.avatarText, isDriverMsg && styles.avatarTextDriver]}>
              {item.senderName?.[0] || '?'}
            </Text>
          </View>
        )}
        {!mine && !showName && <View style={styles.avatarSpacer} />}

        <View style={[styles.msgCol, mine && styles.msgColMe]}>
          {showName && !mine && (
            <Text style={styles.senderName}>
              {item.senderName}
              {isDriverMsg && <Text style={styles.driverTag}> · Driver</Text>}
            </Text>
          )}
          <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, mine && styles.bubbleTextMe]}>{item.text}</Text>
          </View>
          {showTime && (
            <Text style={[styles.timeText, mine && styles.timeTextMe]}>
              {formatTime(item.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Trip Chat</Text>
          <Text style={styles.headerSub}>{tripRoute}</Text>
        </View>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerIcon}>🔒</Text>
        <Text style={styles.bannerText}>Visible to all passengers on this trip and the driver</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  backBtn:        { width: 32 },
  backIcon:       { color: colors.white, fontSize: 22 },
  headerCenter:   { flex: 1, alignItems: 'center' },
  headerTitle:    { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.white },
  headerSub:      { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  liveRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot:        { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ECC71' },
  liveText:       { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' },
  banner:         { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  bannerIcon:     { fontSize: 12 },
  bannerText:     { flex: 1, fontSize: typography.fontSize.xs, color: colors.primary },
  messageList:    { padding: spacing.md, paddingBottom: spacing.lg },
  msgRow:         { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  msgRowMe:       { justifyContent: 'flex-end' },
  avatar:         { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, marginBottom: 2 },
  avatarDriver:   { backgroundColor: colors.primary },
  avatarText:     { fontSize: 12, fontWeight: '700', color: colors.primary },
  avatarTextDriver:{ color: colors.white },
  avatarSpacer:   { width: 36 },
  msgCol:         { maxWidth: '72%' },
  msgColMe:       { alignItems: 'flex-end' },
  senderName:     { fontSize: typography.fontSize.xs, color: colors.textMuted, marginBottom: 2, marginLeft: 4 },
  driverTag:      { color: colors.primary, fontWeight: '700' },
  bubble:         { borderRadius: 18, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleMe:       { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem:     { backgroundColor: colors.white, borderBottomLeftRadius: 4, ...shadows.sm },
  bubbleText:     { fontSize: typography.fontSize.base, color: colors.textPrimary, lineHeight: 22 },
  bubbleTextMe:   { color: colors.white },
  timeText:       { fontSize: 10, color: colors.textMuted, marginTop: 2, marginLeft: 4 },
  timeTextMe:     { marginLeft: 0, marginRight: 4 },
  inputBar:       { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  textInput:      { flex: 1, backgroundColor: colors.background, borderRadius: 22, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: typography.fontSize.base, color: colors.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
  sendBtn:        { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:{ backgroundColor: colors.border },
  sendIcon:       { color: colors.white, fontSize: 16, marginLeft: 2 },
});
