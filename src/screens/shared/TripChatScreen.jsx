import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { MOCK_MESSAGES } from '../../data/mockData';
import { colors, typography, spacing, radius, shadows } from '../../theme';

function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
}

const BackIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SendIcon = ({ active }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={active ? colors.white : colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LockIcon = () => (
  <Svg width="11" height="11" viewBox="0 0 24 24" fill="none">
    <Path d="M7 11V7a5 5 0 0110 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" stroke={colors.primary} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const CheckDoubleIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L7 17l-5-5" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 6L11 17" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

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
    setMessages(prev => [...prev, {
      id:         'msg_' + Date.now(),
      senderUid:  user.uid,
      senderName: user.fullName,
      senderRole: user.role,
      text:       trimmed,
      createdAt:  new Date(),
      readBy:     [user.uid],
    }]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const isMe = msg => msg.senderUid === user?.uid;

  const renderMessage = ({ item, index }) => {
    const mine        = isMe(item);
    const isDriverMsg = item.senderRole === 'driver';
    const showName    = !mine && (index === 0 || messages[index - 1]?.senderUid !== item.senderUid);
    const showTime    = index === messages.length - 1 || messages[index + 1]?.senderUid !== item.senderUid;

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
            <View style={[styles.timeRow, mine && styles.timeRowMe]}>
              <Text style={[styles.timeText, mine && styles.timeTextMe]}>
                {formatTime(item.createdAt)}
              </Text>
              {mine && <CheckDoubleIcon />}
            </View>
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
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {/* Group avatar */}
          <View style={styles.groupAvatar}>
            <Text style={styles.groupAvatarText}>
              {driverName?.[0] || 'T'}
            </Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Trip Chat</Text>
            <Text style={styles.headerSub}>{tripRoute}</Text>
          </View>
        </View>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Privacy banner */}
      <View style={styles.banner}>
        <LockIcon />
        <Text style={styles.bannerText}>Visible to all passengers and the driver on this trip</Text>
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

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <SendIcon active={!!text.trim()} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: colors.background },
  header:            { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backBtn:           { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerCenter:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupAvatar:       { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  groupAvatarText:   { color: colors.white, fontWeight: '800', fontSize: 15 },
  headerTitle:       { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.white },
  headerSub:         { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  liveRow:           { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot:           { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2ECC71' },
  liveText:          { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  banner:            { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, paddingHorizontal: spacing.lg, paddingVertical: 8, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  bannerText:        { flex: 1, fontSize: typography.fontSize.xs, color: colors.primary },
  messageList:       { padding: spacing.md, paddingBottom: spacing.lg },
  msgRow:            { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  msgRowMe:          { justifyContent: 'flex-end' },
  avatar:            { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm, marginBottom: 2, flexShrink: 0 },
  avatarDriver:      { backgroundColor: colors.primary },
  avatarText:        { fontSize: 12, fontWeight: '700', color: colors.primary },
  avatarTextDriver:  { color: colors.white },
  avatarSpacer:      { width: 38 },
  msgCol:            { maxWidth: '72%' },
  msgColMe:          { alignItems: 'flex-end' },
  senderName:        { fontSize: typography.fontSize.xs, color: colors.textMuted, marginBottom: 3, marginLeft: 4 },
  driverTag:         { color: colors.primary, fontWeight: '700' },
  bubble:            { borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 10 },
  bubbleMe:          { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  bubbleThem:        { backgroundColor: colors.white, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: colors.border },
  bubbleText:        { fontSize: typography.fontSize.base, color: colors.textPrimary, lineHeight: 22 },
  bubbleTextMe:      { color: colors.white },
  timeRow:           { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3, marginLeft: 4 },
  timeRowMe:         { justifyContent: 'flex-end', marginLeft: 0, marginRight: 4 },
  timeText:          { fontSize: 10, color: colors.textMuted },
  timeTextMe:        { color: colors.textMuted },
  inputBar:          { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  textInput:         { flex: 1, backgroundColor: colors.background, borderRadius: 22, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 10 : 8, fontSize: typography.fontSize.base, color: colors.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
  sendBtn:           { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sendBtnActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
});