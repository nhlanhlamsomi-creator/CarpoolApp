import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, Alert, ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { submitRating } from '../../services/trips.service';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { sanitiseText } from '../../utils/sanitise';

const ShieldIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 12l2 2 4-4" stroke={colors.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const SkipArrowIcon = () => (
  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <Path d="M5 12h14M13 6l6 6-6 6" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" fill={colors.primary} />
    <Path d="M8 12l3 3 5-5" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const StarFilled = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#F39C12"/>
  </Svg>
);

const StarOutline = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="none" stroke={colors.border} strokeWidth="1.5" strokeLinejoin="round"/>
  </Svg>
);

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
const RATING_COLORS = ['', colors.error, colors.warning, '#F39C12', colors.primary, '#27AE60'];

const QUICK_COMMENTS = [
  'Great driver!', 'Very punctual', 'Safe driving',
  'Friendly and polite', 'Clean vehicle', 'Good route taken',
];

export default function RateDriverScreen({ navigation, route }) {
  const { tripId, driverName, driverUid, bookingId } = route?.params || {};
  const { user } = useAuth();

  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [comment, setComment]         = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading]         = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rate your driver', 'Tap a star to rate your experience.');
      return;
    }
    setLoading(true);
    try {
      const fullComment = [...selectedTags, comment.trim() ? sanitiseText(comment) : '']
        .filter(Boolean).join(' · ');
      await submitRating({ tripId, bookingId, passengerUid: user.uid, driverUid, score: rating, comment: fullComment });
      Alert.alert('Thanks for your rating!', 'Your feedback helps keep CarpoolGo safe and reliable.',
        [{ text: 'Done', onPress: () => navigation.replace('PassengerTabs') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hovered || rating;
  const activeColor   = displayRating ? RATING_COLORS[displayRating] : colors.border;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <Text style={styles.title}>Rate Your Driver</Text>
        <Text style={styles.sub}>Your feedback stays between you and our team</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Driver card */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatarWrap}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>{driverName?.[0] || 'D'}</Text>
            </View>
            <View style={styles.completedBadge}>
              <CheckCircleIcon />
            </View>
          </View>
          <Text style={styles.driverName}>{driverName || 'Your Driver'}</Text>
          <View style={styles.completedPill}>
            <Text style={styles.completedText}>Trip completed</Text>
          </View>
        </View>

        {/* Stars */}
        <View style={styles.starsCard}>
          <Text style={styles.ratingQuestion}>How was your ride?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                onPressIn={() => setHovered(star)}
                onPressOut={() => setHovered(0)}
                activeOpacity={0.7}
              >
                {displayRating >= star ? <StarFilled /> : <StarOutline />}
              </TouchableOpacity>
            ))}
          </View>
          {displayRating > 0 && (
            <View style={[styles.ratingLabelPill, { backgroundColor: activeColor + '18' }]}>
              <Text style={[styles.ratingLabelText, { color: activeColor }]}>
                {RATING_LABELS[displayRating]}
              </Text>
            </View>
          )}
        </View>

        {/* Quick tags */}
        {rating > 0 && (
          <View style={styles.tagsCard}>
            <Text style={styles.tagsTitle}>What went well?</Text>
            <View style={styles.tagsWrap}>
              {QUICK_COMMENTS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
                >
                  {selectedTags.includes(tag) && (
                    <Svg width="12" height="12" viewBox="0 0 24 24">
                      <Path d="M20 6L9 17l-5-5" stroke={colors.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  )}
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Comment */}
        {rating > 0 && (
          <View style={styles.commentCard}>
            <Text style={styles.commentLabel}>Additional comments (optional)</Text>
            <TextInput
              style={styles.commentInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us more about your experience..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
            <Text style={styles.charCount}>{comment.length}/300</Text>
          </View>
        )}

        {/* Privacy */}
        <View style={styles.privacyNote}>
          <ShieldIcon />
          <Text style={styles.privacyText}>
            Ratings are private. Drivers only see their average score, not individual reviews.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: rating > 0 ? activeColor : colors.border }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('PassengerTabs')}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
          <SkipArrowIcon />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: colors.background },
  header:            { backgroundColor: colors.primary, paddingTop: 52, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center' },
  title:             { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  sub:               { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content:           { padding: spacing.lg, paddingBottom: 48 },
  driverCard:        { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md, ...shadows.md },
  driverAvatarWrap:  { position: 'relative', marginBottom: spacing.md },
  driverAvatar:      { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  driverInitial:     { color: colors.primary, fontWeight: '800', fontSize: 34 },
  completedBadge:    { position: 'absolute', bottom: 0, right: -2, backgroundColor: colors.white, borderRadius: 12, padding: 1 },
  driverName:        { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  completedPill:     { backgroundColor: '#E8F5E9', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5 },
  completedText:     { fontSize: typography.fontSize.xs, color: '#2E7D32', fontWeight: '700' },
  starsCard:         { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md, ...shadows.sm },
  ratingQuestion:    { fontSize: typography.fontSize.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.lg },
  starsRow:          { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  ratingLabelPill:   { borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 6, marginTop: 4 },
  ratingLabelText:   { fontSize: typography.fontSize.base, fontWeight: '800' },
  tagsCard:          { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  tagsTitle:         { fontSize: typography.fontSize.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  tagsWrap:          { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag:               { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 8, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  tagSelected:       { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText:           { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  tagTextSelected:   { color: colors.white, fontWeight: '600' },
  commentCard:       { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  commentLabel:      { fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  commentInput:      { fontSize: typography.fontSize.base, color: colors.textPrimary, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, textAlignVertical: 'top', minHeight: 88 },
  charCount:         { fontSize: typography.fontSize.xs, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  privacyNote:       { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  privacyText:       { flex: 1, fontSize: typography.fontSize.xs, color: colors.primary, lineHeight: 18 },
  submitBtn:         { borderRadius: radius.full, paddingVertical: 18, alignItems: 'center', marginBottom: spacing.md },
  submitBtnText:     { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  skipBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md },
  skipBtnText:       { color: colors.textMuted, fontSize: typography.fontSize.base },
});