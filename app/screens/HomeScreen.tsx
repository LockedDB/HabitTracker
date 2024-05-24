import { Backdrop } from "app/components"
import { Habit, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { useMountEffect } from "app/utils/useMountEffect"
import { observer } from "mobx-react-lite"

import React, { FC, useRef, useState } from "react"
import { FlatList, ImageBackground, ImageStyle, useWindowDimensions } from "react-native"
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"
import { $root, MemoizedCard } from "./HabitCard"

const dumbbell = require("../../assets/images/dumbbells.png")

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
    <ImageBackground style={$root} imageStyle={$imageBg} source={dumbbell}>
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
    </ImageBackground>
  )
})

const $imageBg: ImageStyle = {
  opacity: 0.7,
}
