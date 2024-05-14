import { Backdrop, Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import { FlatList, Pressable, ViewStyle, useWindowDimensions } from "react-native"
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

interface HomeScreenProps extends AppStackScreenProps<"Home"> {}

const rectangles = [
  { id: "1", color: colors.error },
  { id: "2", color: colors.border },
  { id: "3", color: colors.separator },
]

const COMPLETE_HABIT_TIME = 3000
const HABIT_CANCELED_TIME = 500

/**
 * 1. Manage to stop the scroll at the right points ✅
 * 2. Animation of scaling left and right rectangles ✅
 * 3. Infinite scroll one way ✅
 * 4. Pressing the card makes it scale down slowly ✅
 * 5. Add slowly a dark backdrop to the card ✅
 * 6. At the same time, the card shakes every second a bit more
 */
export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const scrollX = useSharedValue(0)
  const scrollViewRef = useRef<FlatList>(null)
  const currentIndex = useSharedValue(0)
  const pressing = useSharedValue(false)

  const { width: screenWidth } = useWindowDimensions()

  const [data, setData] = React.useState(rectangles)

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
    const newRectangles = rectangles.map((rectangle, index) => ({
      ...rectangle,
      id: `${data.length + index + 1}`,
    }))

    setData([...data, ...newRectangles])
  }, [data])

  return (
    <Screen style={$root} contentContainerStyle={$container} preset="fixed">
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
          <MemoizedItem
            listCurrentIndex={currentIndex}
            item={item}
            index={index}
            scrollX={scrollX}
            pressing={pressing}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        pagingEnabled
        windowSize={1}
        showsHorizontalScrollIndicator={false}
      />
    </Screen>
  )
})

type ItemProps = {
  item: { id: string; color: string }
  index: number
  scrollX: SharedValue<number>
  listCurrentIndex: SharedValue<number>
  pressing: SharedValue<boolean>
}

function Item(props: ItemProps) {
  const { item, index, scrollX, listCurrentIndex, pressing } = props

  const { width: screenWidth } = useWindowDimensions()

  const scaleDown = useDerivedValue(() =>
    pressing.value && index === listCurrentIndex.value
      ? // TODO: Add withDecay to slow down at the end
        withTiming(0.7, { duration: COMPLETE_HABIT_TIME })
      : withTiming(1, { duration: 500 }),
  )

  const $rectangleContainer: ViewStyle = {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  }

  const $rectangle: ViewStyle = {
    width: screenWidth / 1.5,
    aspectRatio: 1 / 1.5,
    borderRadius: 4,
    shadowColor: colors.palette.neutral800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }

  const togglePressing = () => {
    pressing.value = !pressing.value
  }

  const $rRectangle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]
    const outputRange = [0.5, 1, 0.5]

    const scale = scaleDown.value * interpolate(scrollX.value, inputRange, outputRange)

    return {
      transform: [{ scale }],
    }
  })

  return (
    <Pressable style={$rectangleContainer} onPressIn={togglePressing} onPressOut={togglePressing}>
      <Animated.View style={[$rectangle, $rRectangle, { backgroundColor: item.color }]} />
    </Pressable>
  )
}

const MemoizedItem = React.memo(Item)

const $root: ViewStyle = {
  flex: 1,
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  flexDirection: "row",
  alignItems: "center",
}
