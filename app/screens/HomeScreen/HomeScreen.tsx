import { Habit, useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { useMountEffect } from "app/utils/useMountEffect"
import { observer } from "mobx-react-lite"

import { themeData } from "app/models/Theme"
import { spacing } from "app/theme"
import React, { FC, useRef, useState } from "react"
import { FlatList, ImageSourcePropType, View, useWindowDimensions } from "react-native"
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"
import { $root, CardScene } from "./components/CardScene"

interface HomeScreenProps extends AppStackScreenProps<"Home"> { }

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()

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

  // Current tab being displayed, changes when the user scrolls halfway through the screen
  const currentTab = useSharedValue(1)

  // Data for the flatlist, contains the habits and two extra items at the beginning and end
  const [data, setData] = useState<Habit[]>(habits)

  const listRef = useRef<FlatList>(null)

  // Scroll to beggining or end of the list
  const scrollToOffset = (index: number) => {
    listRef.current?.scrollToOffset({
      offset: index * screenWidth + index * SPACING_CARDS,
      animated: false,
    })
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x

      scrollXNormalized.value = (event.contentOffset.x % screenWidth) / screenWidth

      // Ensure the current tab is between 1 and the number of habits, if there is a delay in the jumpTo
      // the current tab will try to access an index that doesn't exist, so we need to limit it
      currentTab.value = Math.max(1, Math.min(Math.round(scrollX.value / screenWidth), habits.length))

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
    <View style={$root}>
      <Animated.FlatList
        ref={listRef}
        data={data}
        contentOffset={{ x: screenWidth + SPACING_CARDS, y: 0 }}
        renderItem={({ item }) => <CardScene item={item} />}
        horizontal
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        snapToOffsets={data.map((_, index) => index * screenWidth + index * SPACING_CARDS)}
        decelerationRate="fast"
        disableIntervalMomentum
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index + spacing.md,
          index,
        })}
        ItemSeparatorComponent={Separator}
        style={{ height: screenHeight }}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
})

const Separator = () => <View style={{ width: SPACING_CARDS }} />

const SPACING_CARDS = spacing.xl
