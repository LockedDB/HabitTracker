import { Icon } from "app/components"
import { colors, spacing } from "app/theme"
import React from "react"
import { Dimensions, ImageStyle, StyleProp, ViewStyle } from "react-native"
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"

const SCREEN_WIDTH = Dimensions.get("window").width

type BackProps = { flip: SharedValue<number> }

export function Back({ flip }: BackProps) {
  const $rAnimatedBackTransform = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [Math.PI, 2 * Math.PI])

    return {
      zIndex: flip.value === 0 ? -1 : 1,
      transform: [{ perspective: 1000 }, { rotateY: withTiming(`${rotateY}rad`) }],
    }
  })

  const $emptyCardStyle: StyleProp<ViewStyle> = [
    $card,
    {
      position: "absolute",
      zIndex: flip.value === 0 ? -1 : 1,
      width: SCREEN_WIDTH / 1.3,
    },
    $rAnimatedBackTransform,
  ]

  return (
    <Animated.View style={$emptyCardStyle}>
      <Icon
        icon="settings"
        size={20}
        containerStyle={$settingsIcon}
        onPress={() => {
          flip.value = flip.value === 0 ? 1 : 0
        }}
      />
    </Animated.View>
  )
}

const $settingsIcon: ImageStyle = {
  position: "absolute",
  top: spacing.md,
  left: spacing.md,
  opacity: 0.2,
}

const $card: ViewStyle = {
  aspectRatio: 1 / 1.5,
  borderRadius: 32,
  shadowColor: colors.shadow,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 4,
  backgroundColor: colors.background,
  borderColor: colors.border,
  borderCurve: "continuous",
  borderWidth: 4,
}
