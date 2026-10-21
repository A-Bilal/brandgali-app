import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';
import { useFollows } from '@/data/follows-context';

type Props = {
  brandId: string;
  brandName: string;
  /** "large" is the full-width button on a brand's page. */
  size?: 'small' | 'large';
};

export function FollowButton({ brandId, brandName, size = 'small' }: Props) {
  const { isFollowing, toggleFollow } = useFollows();
  const following = isFollowing(brandId);
  const large = size === 'large';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        toggleFollow(brandId);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: following }}
      accessibilityLabel={following ? `Unfollow ${brandName}` : `Follow ${brandName}`}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        large ? styles.large : styles.small,
        following ? styles.following : large ? styles.followLarge : styles.follow,
        pressed && { opacity: 0.8 },
      ]}>
      {following ? (
        <Ionicons name="checkmark" size={large ? 18 : 15} color={Colors.white} />
      ) : large ? (
        <Ionicons name="notifications-outline" size={18} color={Colors.white} />
      ) : null}
      <Text
        style={[
          styles.label,
          large && styles.labelLarge,
          { color: following || large ? Colors.white : Colors.navy },
        ]}>
        {following ? 'Following' : large ? 'Follow for alerts' : 'Follow'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  small: { minHeight: 36, paddingHorizontal: 14, borderRadius: 10 },
  large: { minHeight: 48, paddingHorizontal: 16, borderRadius: Radius.md, flex: 1 },
  follow: { borderWidth: 1.5, borderColor: Colors.navy, backgroundColor: 'transparent' },
  followLarge: { backgroundColor: Colors.navy },
  following: { backgroundColor: Colors.tealDeep },
  label: { fontFamily: Fonts.bodyBold, fontSize: 13 },
  labelLarge: { fontSize: 15 },
});
