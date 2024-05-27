import { Habit, useStores } from "app/models"
import { themeData } from "app/models/Theme"
import { colors } from "app/theme"
import React, { useRef } from "react"
import { Dimensions, ImageBackground, ImageStyle, Pressable, ViewStyle } from "react-native"
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { Back } from "./Back"
import { Front } from "./Front"
import { COMPLETE_HABIT_TIME, cardRadius } from "./consts"

const SCREEN_WIDTH = Dimensions.get("window").width

type CardProps = {
  item: Habit
  index: number
  scrollX: SharedValue<number>
  pressing: SharedValue<boolean>
  selectedIndex: SharedValue<number>
}

function CardScene(props: CardProps) {
  const rootStore = useStores()
  const { item, index, scrollX, pressing } = props
  const theme = themeData[item.theme]

  const timeoutRef = useRef<NodeJS.Timeout>()

  const flip = useSharedValue(0)

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
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ]

    // Define the scale values for the previous, current, and next card
    const outputRange = [0.3, 1, 0.3] // Scale is smaller for the previous
    const scale = interpolate(scrollX.value, inputRange, outputRange)
    return { transform: [{ scale }] }
  })

  return (
    <AnimatedImageBackground
      source={theme.image}
      imageStyle={{ borderRadius: cardRadius }}
      style={[$cardEffects, $rScale]}
    >
      <Pressable style={$cardContainerStyle} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Back flip={flip} />
        <Front flip={flip} theme={theme} {...props} />
      </Pressable>
    </AnimatedImageBackground>
  )
}

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

export const CardSceneMemo = React.memo(CardScene)

export const $root: ViewStyle = {
  flex: 1,
}

const $cardEffects: ImageStyle = {
  shadowColor: colors.shadow,
  shadowOpacity: 1,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 4,
  backgroundColor: colors.background,
  borderRadius: cardRadius,
  justifyContent: "center",
}

const $cardContainerStyle: ViewStyle = {
  position: "relative",
  width: SCREEN_WIDTH,
  alignItems: "center",
  alignSelf: "center",
}
