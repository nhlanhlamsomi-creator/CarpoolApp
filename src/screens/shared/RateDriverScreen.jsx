import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, Alert, ScrollView,
} from 'react-native';
import { submitRating } from '../../services/trips.service';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { sanitiseText } from '../../utils/sanitise';

const QUICK_COMMENTS = [
  'Great driver!',
  'Very punctual',
  'Safe driving',
  'Friendly and polite',
  'Clean vehicle',
  'Good route taken',
];

export default function RateDriverScreen({ navigation, route }) {
  const { tripId, driverName, driverUid, bookingId } = route?.params || {};
  const { user } = useAuth();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Please rate your driver', 'Tap a star to rate your experience.');
      return;
    }

    setLoading(true);
    try {
      const fullComment = [
        ...selectedTags,
        comment.trim() ? sanitiseText(comment) : '',
      ]
        .filter(Boolean)
        .join(' · ');

      await submitRating({
        tripId,
        bookingId,
        passengerUid: user.uid,
        driverUid,
        score: rating,
        comment: fullComment,
      });

      Alert.alert(
        'Thanks for your rating! 🌟',
        'Your feedback helps keep CarpoolGo safe and reliable.',
        [{ text: 'Done', onPress: () => navigation.replace('PassengerTabs') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace('PassengerTabs');
  };

  const displayRating = hovered || rating;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rate Your Driver</Text>
        <Text style={styles.sub}>Your feedback stays between you and our team</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Driver card */}
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>{driverName?.[0] || 'D'}</Text>
          </View>
          <Text style={styles.driverName}>{driverName || 'Your Driver'}</Text>
          <Text style={styles.tripRoute}>Trip completed</Text>
        </View>

        {/* Star rating */}
        <View style={styles.starsSection}>
          <Text style={styles.ratingQuestion}>How was your ride?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                onPressIn={() => setHovered(star)}
                onPressOut={() => setHovered(0)}
                style={styles.starBtn}
                activeOpacity={0.8}
              >
                <Text style={[styles.star, displayRating >= star && styles.starFilled]}>
                  {displayRating >= star ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </Text>
          )}
        </View>

        {/* Quick tags */}
        {rating > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsTitle}>What went well?</Text>
            <View style={styles.tagsWrap}>
              {QUICK_COMMENTS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tag,
                    selectedTags.includes(tag) && styles.tagSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(tag) && styles.tagTextSelected,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Written comment */}
        {rating > 0 && (
          <View style={styles.commentSection}>
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

        {/* Privacy notice */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            Ratings are private. Drivers only see their average score, not individual reviews.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Submitting...' : `Submit Rating  ${'★'.repeat(rating)}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: { fontSize: typography.fontSize.xxl, fontWeight: '800', color: colors.white },
  sub: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content: { padding: spacing.lg, paddingBottom: 48 },
  driverCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  driverAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  driverInitial: { color: colors.primary, fontWeight: '800', fontSize: 32 },
  driverName: { fontSize: typography.fontSize.xl, fontWeight: '700', color: colors.textPrimary },
  tripRoute: { fontSize: typography.fontSize.sm, color: colors.textMuted, marginTop: 4 },
  starsSection: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  ratingQuestion: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  starsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  starBtn: { padding: 4 },
  star: { fontSize: 42, color: colors.border },
  starFilled: { color: '#F39C12' },
  ratingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.primary,
  },
  tagsSection: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  tagsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tagSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  tagTextSelected: { color: colors.white, fontWeight: '600' },
  commentSection: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  commentLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  commentInput: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  privacyIcon: { fontSize: 14 },
  privacyText: { flex: 1, fontSize: typography.fontSize.xs, color: colors.primary, lineHeight: 18 },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitBtnText: { color: colors.white, fontWeight: '800', fontSize: typography.fontSize.base },
  skipBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipBtnText: { color: colors.textMuted, fontSize: typography.fontSize.base },
});
