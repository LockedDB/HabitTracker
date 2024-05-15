import { Backdrop, Screen, Text } from "app/components"
import { Habit, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef, useState } from "react"
import {
  FlatList,
  Pressable,
  StyleProp,
  TextStyle,
  ViewStyle,
  useWindowDimensions,
} from "react-native"
import Animated, {
  Easing,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

const COMPLETE_HABIT_TIME = 3000
const HABIT_CANCELED_TIME = 500

/**
 * 1. Manage to stop the scroll at the right points ✅
 * 2. Animation of scaling left and right rectangles ✅
 * 3. Infinite scroll one way ✅
 * 4. Pressing the card makes it scale up slowly ✅
 * 5. Add slowly a dark backdrop to the card ✅
 * 6. At the same time, the card shakes every second a bit more ✅
 * 7. Add pagination dots (could be mini versions of the cards in the future)
 */
export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const { habits } = useStores()
  const scrollX = useSharedValue(0)
  const scrollViewRef = useRef<FlatList>(null)
  const currentIndex = useSharedValue(0)
  const pressing = useSharedValue(false)

  const { width: screenWidth } = useWindowDimensions()

  const [data, setData] = useState<Habit[]>(habits)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
    onMomentumEnd: (event) => {
      // Calculate the current index being displayed
      const { contentOffset } = event
      const index = Math.round(contentOffset.x / screenWidth)

      currentIndex.value = index
    },
  })

  const onEndReached = useCallback(() => {
    const newRectangles = habits.map((rectangle) => ({
      ...rectangle,
    }))

    setData([...data, ...newRectangles])
  }, [data])

  return (
    <Screen
      style={$root}
      contentContainerStyle={$container}
      preset="fixed"
      backgroundColor={colors.backgroundSecondary}
    >
      <Backdrop
        visible={pressing}
        enterAnimationConfig={{ duration: COMPLETE_HABIT_TIME }}
        exitAnimationConfig={{ duration: HABIT_CANCELED_TIME }}
      />
      <Animated.FlatList
        ref={scrollViewRef}
        data={data}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        renderItem={({ item, index }) => (
          <MemoizedCard
            selectedIndex={currentIndex}
            item={item}
            index={index}
            scrollX={scrollX}
            pressing={pressing}
          />
        )}
        horizontal
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        pagingEnabled
        windowSize={1}
        showsHorizontalScrollIndicator={false}
      />
      {/* Pagination
       * 1. Add the three dots at the bottom of the screen
       * 7. The habits completed can have a little checkmark on the dot
       */}
    </Screen>
  )
})

type CardProps = {
  item: Habit
  index: number
  scrollX: SharedValue<number>
  pressing: SharedValue<boolean>
  selectedIndex: SharedValue<number>
}

function Card(props: CardProps) {
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
      console.log("Habit completed!")
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

const MemoizedCard = React.memo(Card)

const $root: ViewStyle = {
  flex: 1,
}

const $text: TextStyle = {
  textAlign: "center",
  color: colors.text,
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  flexDirection: "row",
  alignItems: "center",
}
