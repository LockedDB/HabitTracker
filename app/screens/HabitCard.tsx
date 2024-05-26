import { Icon, IconTypes, Text } from "app/components"
import { Habit, useStores } from "app/models"
import { themeData } from "app/models/Theme"
import { colors, spacing } from "app/theme"
import React, { useRef } from "react"
import {
  ImageBackground,
  ImageStyle,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
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

type CardProps = {
  item: Habit
  index: number
  scrollX: SharedValue<number>
  pressing: SharedValue<boolean>
  selectedIndex: SharedValue<number>
}

function HabitCard(props: CardProps) {
  const rootStore = useStores()
  const { item, index, scrollX, selectedIndex, pressing } = props
  const theme = themeData[item.theme]

  const { width: screenWidth } = useWindowDimensions()

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
      ? withTiming(1, { duration: COMPLETE_HABIT_TIME, easing: Easing.out(Easing.ease) })
      : withTiming(0.9, { duration: 500 }),
  )

  const timeoutRef = useRef<NodeJS.Timeout>()

  const onPressOut = () => {
    pressing.value = false
    clearTimeout(timeoutRef.current)
  }

  // When the card is pressed, for `COMPLETE_HABIT_TIME`
  // it will complete the habit
  const onPressIn = () => {
    pressing.value = true

    timeoutRef.current = setTimeout(() => {
      // Since it can happen that the user presses the "duplicated" cards
      // we need to find its real counterpart
      switch (item.id) {
        case "first":
          rootStore.toggleHabit(rootStore.habits[0].id)
          break
        case "last":
          rootStore.toggleHabit(rootStore.habits[rootStore.habits.length - 1].id)
          break
        default:
          rootStore.toggleHabit(item.id)
          break
      }
    }, COMPLETE_HABIT_TIME)
  }

  const $rScale = useAnimatedStyle(() => {
    // Define the range of scroll positions for the previous, current, and next card
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]

    // Define the scale values for the previous, current, and next card
    const outputRange = [0.3, 1, 0.3] // Scale is smaller for the previous
    const scale = interpolate(scrollX.value, inputRange, outputRange)
    return { transform: [{ scale }] }
  })

  const $rAnimatedTransform = useAnimatedStyle(() => {
    // Define the range of scroll positions for the previous, current, and next card
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]

    // Define the scale values for the previous, current, and next card
    const outputRange = [0.3, 1, 0.3] // Scale is smaller for the previous and next cards

    // Calculate the scale of the card based on the current scroll position
    const scale = pressingAnimation.value * interpolate(scrollX.value, inputRange, outputRange)

    return {
      transform: [
        { scale },
        { translateX: pressingVibrate.value },
        { translateY: pressingVibrate.value },
      ],
    }
  })

  const $textColor: TextStyle = { color: theme.color }

  const $rectangleContainer: ViewStyle = {
    width: screenWidth,
    alignItems: "center",
    alignSelf: "center",
  }

  const $cardStyle: StyleProp<ViewStyle> = [
    $card,
    { width: screenWidth / 1.2 },
    $rAnimatedTransform,
  ]

  return (
    <>
      <AnimatedImageBackground
        source={theme.image}
        imageStyle={{ borderRadius: $card.borderRadius }}
        style={[StyleSheet.absoluteFill, $cardEffects, $rScale]}
      />
      <Pressable style={$rectangleContainer} onPressIn={onPressIn} onPressOut={onPressOut}>
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
                I will read a page every night after getting in bed so that I can become an
                interesting person.
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
              onPress={() => console.log("settings")}
              icon="settings"
              size={20}
              containerStyle={$settingsIcon}
            />
            <Text size="xxs" style={$pagination}>
              {index}/{rootStore.habits.length}
            </Text>
          </ImageBackground>
        </Animated.View>
      </Pressable>
    </>
  )
}

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

export const MemoizedCard = React.memo(HabitCard)

const days = ["M", "T", "W", "T", "F", "S", "S"]

export const $root: ViewStyle = {
  flex: 1,
}

const $cardEffects: ImageStyle = {
  borderRadius: 32,
  shadowColor: colors.shadow,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 4,
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

const COMPLETE_HABIT_TIME = 3000
