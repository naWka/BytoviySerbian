import { View } from 'react-native';

import { CardPager } from '@/components/Pager';
import { Screen, Txt } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { content } from '@/lib/content';

export default function SosScreen() {
  return (
    <Screen padded={false} edges={['bottom']}>
      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
        <Txt variant="body" muted>
          Когда поплыл: замедлить, переспросить, попросить написать.
        </Txt>
      </View>
      <CardPager cards={content.sos} />
    </Screen>
  );
}
