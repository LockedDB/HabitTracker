import { Habit, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { useMountEffect } from "app/utils/useMountEffect"
import { observer } from "mobx-react-lite"

import { Backdrop } from "app/components"
import { themeData } from "app/models/Theme"
import React, { FC, useRef, useState } from "react"
import {
  FlatList,
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  useWindowDimensions,
} from "react-native"
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"
import { $root, MemoizedCard } from "./HabitCard"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions()

  // Get the habits from the store. Since reanimated cannot work with mobx observables,
  // we need to extract the data in a JS format
  const habits = useStores().jsHabits

  const [bgImage, setCurrentBgImage] = useState<ImageSourcePropType>(
    themeData[habits[0].theme].image,
  )

  // Scroll value for the flatlist, copied from the scroll event content offset
  const scrollX = useSharedValue(screenWidth)
  // Normalized scroll value, goes from 0 to 1
  const scrollXNormalized = useSharedValue(0)

  const isPressing = useSharedValue(false)

  // Current tab being displayed, changes when the user scrolls halfway through the screen
  const currentTab = useSharedValue(1)

  // Data for the flatlist, contains the habits and two extra items at the beginning and end
  const [data, setData] = useState<Habit[]>(habits)

  const listRef = useRef<FlatList>(null)

  // Scroll to beggining or end of the list
  const scrollToOffset = (index: number) => {
    listRef.current?.scrollToOffset({ offset: index * screenWidth, animated: false })
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x

      scrollXNormalized.value = (event.contentOffset.x % screenWidth) / screenWidth

      currentTab.value = Math.round(scrollX.value / screenWidth)

      const newImage: ImageSourcePropType = themeData[data[currentTab.value].theme].image
      if (newImage !== bgImage) {
        runOnJS(setCurrentBgImage)(newImage)
      }
    },
    onMomentumEnd: (event) => {
      // Calculate the current index being displayed
      const { contentOffset } = event
      const index = Math.round(contentOffset.x / screenWidth)

      // If the index is the first or last, scroll to the opposite end
      // to create the infinite scroll effect
      if (habits.length > 1 && (index === 0 || index === habits.length + 1)) {
        const newIndex = index === 0 ? habits.length : 1
        runOnJS(scrollToOffset)(newIndex)
        currentTab.value = newIndex
      }

      // Reset the normalized value when the user stops scrolling on each card
      scrollXNormalized.value = 0
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
    <ImageBackground style={$root} imageStyle={$imageBg} source={bgImage}>
      <Backdrop
        value={scrollXNormalized}
        inputRange={[0, 0.4, 0.5, 0.6, 1]}
        outputRange={[0, 1, 1, 1, 0]}
      />
      <Animated.FlatList
        ref={listRef}
        data={data}
        contentOffset={{ x: screenWidth, y: 0 }}
        renderItem={({ item, index }) => (
          <MemoizedCard
            selectedIndex={currentTab}
            item={item}
            index={index}
            scrollX={scrollX}
            pressing={isPressing}
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

const $imageBg: ImageStyle = { opacity: 0.7 }
