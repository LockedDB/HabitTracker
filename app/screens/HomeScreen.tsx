import { Backdrop, Screen } from "app/components"
import { Habit, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { colors, spacing } from "app/theme"
import { useMountEffect } from "app/utils/useMountEffect"
import { observer } from "mobx-react-lite"

import React, { FC, useRef, useState } from "react"
import { FlatList, View, ViewStyle, useWindowDimensions } from "react-native"
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { $container, $root, MemoizedCard } from "./HabitCard"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const COMPLETE_HABIT_TIME = 3000
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
  const habits = useStores().jsHabits
  const listRef = useRef<FlatList>(null)
  const currentIndex = useSharedValue(1)
  const pressing = useSharedValue(false)
  const { width: screenWidth } = useWindowDimensions()

  const scrollX = useSharedValue(screenWidth)

  const [data, setData] = useState<Habit[]>(habits)

  // Scroll to beggining or end of the list
  const scrollToOffset = (index: number) => {
    listRef.current?.scrollToOffset({ offset: index * screenWidth, animated: false })
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
    onMomentumEnd: (event) => {
      // Calculate the current index being displayed
      const { contentOffset } = event
      const index = Math.round(contentOffset.x / screenWidth)

      currentIndex.value = index

      // If the index is the first or last, scroll to the opposite end
      // to create the infinite scroll effect
      if (habits.length > 1 && (index === 0 || index === habits.length + 1)) {
        const newIndex = index === 0 ? habits.length : 1
        runOnJS(scrollToOffset)(newIndex)
        currentIndex.value = newIndex
      }
    },
  })

  useMountEffect(() => {
    // Create copies of the first and last habits to create the infinite scroll effect
    // If there's only one habit, don't do anything
    if (habits.length <= 1) return

    // Add a custom id to not conflict with the real ids
    const firstHabit = { ...habits[0], id: "first" }
    const lastHabit = { ...habits[habits.length - 1], id: "last" }

    setData([lastHabit, ...habits, firstHabit])
  })

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
        ref={listRef}
        data={data}
        contentOffset={{ x: screenWidth, y: 0 }}
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
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      {/* Pagination
       * 1. Add the three dots at the bottom of the screen
       * 7. The habits completed can have a little checkmark on the dot
       */}
      <Pagination habits={habits} scrollX={scrollX} />
    </Screen>
  )
})

type PaginationProps = {
  scrollX: SharedValue<number>
  habits: Habit[]
}

function Pagination({ scrollX, habits }: PaginationProps) {
  return (
    <View style={$paginationContainer}>
      {habits.map((_, index) => (
        /* Take into account that the pagination here, starts with offset 1 */
        <Dot key={index} index={index + 1} scrollX={scrollX} />
      ))}
    </View>
  )
}

function Dot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const { width: screenWidth } = useWindowDimensions()
  const $rActive = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]
    const extrapolate = {
      extrapolateLeft: Extrapolation.CLAMP,
      extrapolateRight: Extrapolation.CLAMP,
    }

    const translateY = interpolate(scrollX.value, inputRange, [0, -3, 0], extrapolate)
    const scale = interpolate(scrollX.value, inputRange, [1, 1.1, 1], extrapolate)
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], extrapolate)

    return { opacity, transform: [{ translateY }, { scale }] }
  })

  return <Animated.View style={[$dot, $rActive]} />
}

const $paginationContainer: ViewStyle = {
  flexDirection: "row",
  position: "absolute",
  bottom: spacing.xxxl,
  alignSelf: "center",
  columnGap: spacing.xxxs,
}

const $dot: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 5,
  backgroundColor: colors.tint,
}
