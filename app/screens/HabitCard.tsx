import { Text } from "app/components"
import { Habit, useStores } from "app/models"
import { colors, spacing } from "app/theme"
import React, { useRef } from "react"
import { Pressable, StyleProp, TextStyle, ViewStyle, useWindowDimensions } from "react-native"
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { COMPLETE_HABIT_TIME } from "./HomeScreen"

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
  const timeoutRef = useRef<NodeJS.Timeout>()

  const { width: screenWidth } = useWindowDimensions()

  // As the card grows, the vibration is more intense
  const vibrationMultiplier = useDerivedValue(() =>
    pressing.value && index === selectedIndex.value
      ? withTiming(2.6, { duration: COMPLETE_HABIT_TIME / 2 })
      : 1,
  )

  const vibrate = useDerivedValue(() =>
    pressing.value && index === selectedIndex.value
      ? withRepeat(withTiming(-0.5 * vibrationMultiplier.value, { duration: 50 }), -1, true)
      : 0,
  )

  // Scale up the card when it's being pressed
  const scaleUp = useDerivedValue(() =>
    pressing.value && index === selectedIndex.value
      ? withTiming(1, { duration: COMPLETE_HABIT_TIME, easing: Easing.out(Easing.ease) })
      : withTiming(0.9, { duration: 500 }),
  )

  const $rectangleContainer: ViewStyle = {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  }

  const $rectangle: ViewStyle = {
    width: screenWidth / 1.2,
    aspectRatio: 1 / 1.5,
    borderRadius: 4,
    shadowColor: colors.palette.neutral800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.palette.accent200,
    borderColor: colors.border,
    borderCurve: "continuous",
    borderWidth: 2,
  }

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

  const $rRectangle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]
    const outputRange = [0.5, 0.9, 0.5]

    const scale = scaleUp.value * interpolate(scrollX.value, inputRange, outputRange)

    return { transform: [{ scale }, { translateX: vibrate.value }, { translateY: vibrate.value }] }
  })

  const $cardStyle: StyleProp<ViewStyle> = [$rRectangle, $rectangle]

  return (
    <Pressable style={$rectangleContainer} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={$cardStyle}>
        <Text preset="heading" style={$text}>
          {item.name}
        </Text>
      </Animated.View>
    </Pressable>
  )
}
export const MemoizedCard = React.memo(HabitCard)
export const $root: ViewStyle = {
  flex: 1,
}
const $text: TextStyle = {
  textAlign: "center",
  color: colors.text,
}
export const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  flexDirection: "row",
  alignItems: "center",
}
