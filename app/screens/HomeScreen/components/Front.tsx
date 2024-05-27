import { Icon, IconTypes, Text } from "app/components"
import { useStores } from "app/models"
import { Theme } from "app/models/Theme"
import { colors, spacing } from "app/theme"
import React from "react"
import {
  Dimensions,
  ImageBackground,
  ImageStyle,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { COMPLETE_HABIT_TIME } from "./consts"

const SCREEN_WIDTH = Dimensions.get("window").width

type FrontProps = {
  theme: Theme
  flip: SharedValue<number>
  pressing: SharedValue<boolean>
  selectedIndex: SharedValue<number>
  index: number
}

export function Front({ flip, pressing, theme, index, selectedIndex }: FrontProps) {
  const rootStore = useStores()

  // As the card grows, the vibration is more intense
  const vibrationMultiplier = useDerivedValue(() =>
    pressing.value && index === selectedIndex.value
      ? withTiming(2.6, { duration: COMPLETE_HABIT_TIME / 2 })
      : 1,
  )

  const pressingVibrate = useDerivedValue(() =>
    pressing.value && index === selectedIndex.value
      ? withRepeat(withTiming(-0.5 * vibrationMultiplier.value, { duration: 50 }), -1, true)
      : 0,
  )

  // Scale up the card when it's being pressed
  const pressingAnimation = useDerivedValue(() =>
    pressing.value && index === selectedIndex.value
      ? withTiming(1.1, { duration: 3000, easing: Easing.out(Easing.ease) })
      : withTiming(1, { duration: 500 }),
  )

  const $rAnimatedTransform = useAnimatedStyle(() => {
    const rotateY = interpolate(flip.value, [0, 1], [0, Math.PI])

    // Calculate the scale of the card based on the current scroll position
    const scale = pressing.value && index === selectedIndex.value ? pressingAnimation.value : 1

    return {
      transform: [
        { perspective: 1000 },
        { scale },
        { translateX: pressingVibrate.value },
        { translateY: pressingVibrate.value },
        { rotateY: withTiming(`${rotateY}rad`) },
      ],
      zIndex: flip.value === 0 ? 1 : -1,
    }
  })

  const $textColor: TextStyle = { color: theme.color }

  const $cardStyle: StyleProp<ViewStyle> = [
    $card,
    { width: SCREEN_WIDTH / 1.3 },
    $rAnimatedTransform,
  ]

  return (
    <Animated.View style={$cardStyle}>
      <ImageBackground
        style={$barbellImageContainer}
        source={theme.image}
        imageStyle={$barbellImage}
      >
        <View style={$header}>
          <Text preset="heading" size="xxl" style={$textColor}>
            Be Interesting
          </Text>
          <Text size="sm">
            I will read a page every night after getting in bed so that I can become an interesting
            person.
          </Text>
          <View style={$content}>
            <View style={$streakContainer}>
              {Array.from({ length: 7 }).map((_, index) => {
                const icon = index % 2 === 0 ? theme.icon.active : theme.icon.inactive
                return (
                  <View key={index} style={$iconContainer}>
                    <Icon icon={icon as IconTypes} color={theme.color} />
                    <Text size="xxs" preset="bold" style={$textColor}>
                      {days[index]}
                    </Text>
                  </View>
                )
              })}
            </View>
            <Text preset="bold" size="md">
              Reward
            </Text>
            <Text size="sm">I will put 5€ into an account to pay for courses.</Text>
          </View>
        </View>
        <Icon
          onPress={() => {
            flip.value = flip.value === 0 ? 1 : 0
          }}
          icon="settings"
          size={20}
          containerStyle={$settingsIcon}
        />
        <Text size="xxs" style={$pagination}>
          {index}/{rootStore.habits.length}
        </Text>
      </ImageBackground>
    </Animated.View>
  )
}

const days = ["M", "T", "W", "T", "F", "S", "S"]

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

const $header: ViewStyle = {
  rowGap: spacing.xs,
}

const $content: ViewStyle = {
  rowGap: spacing.xs,
}

const $streakContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: spacing.md,
}

const $iconContainer: ViewStyle = {
  alignItems: "center",
}

const $settingsIcon: ImageStyle = {
  position: "absolute",
  top: spacing.md,
  left: spacing.md,
  opacity: 0.2,
}

const $barbellImageContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  padding: spacing.md,
}

const $barbellImage: ImageStyle = {
  borderRadius: 32,
  opacity: 0.05,
}

const $pagination: TextStyle = {
  position: "absolute",
  bottom: spacing.sm,
  right: spacing.sm,
  fontFamily: "PoetsenOne-Regular",
}
