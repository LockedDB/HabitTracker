import { Screen } from "app/components"
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
  { id: "1", color: colors.separator },
  { id: "2", color: colors.border },
  { id: "3", color: colors.error },
]

/**
 * 1. Manage to stop the scroll at the right points ✅
 * 2. Animation of scaling left and right rectangles ✅
 * 3. Infinite scroll one way ✅
 * 4. Pressing the card makes it scale down slowly ✅
 * 5. At the same time, the card shakes every second a bit more
 * 6. Add slowly a dark backdrop to the card
 */
export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const scrollX = useSharedValue(0)
  const scrollViewRef = useRef<FlatList>(null)
  const currentIndex = useRef(0)
  const { width: screenWidth } = useWindowDimensions()

  const [data, setData] = React.useState(rectangles)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
      if (event.contentOffset.x > currentIndex.current * screenWidth) {
        currentIndex.current += 1
      }
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
    <Screen
      style={$root}
      contentContainerStyle={$container}
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
    >
      <Animated.FlatList
        ref={scrollViewRef}
        data={data}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        renderItem={({ item, index }) => (
          <MemoizedItem
            listCurrentIndex={currentIndex.current}
            item={item}
            index={index}
            scrollX={scrollX}
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
  listCurrentIndex: number
}

function Item(props: ItemProps) {
  const { item, index, scrollX, listCurrentIndex } = props
  const pressing = useSharedValue(false)

  const { width: screenWidth } = useWindowDimensions()

  const scaleDown = useDerivedValue(() =>
    pressing.value && index === listCurrentIndex
      ? // TODO: Add withDecay to slow down at the end
        withTiming(0.7, { duration: 3000 })
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

  const $pressingAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleDown.value }],
    }
  })

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]
    const outputRange = [0.5, 1, 0.5]

    return {
      transform: [{ scale: interpolate(scrollX.value, inputRange, outputRange) }],
    }
  })

  return (
    <Pressable style={$rectangleContainer} onPressIn={togglePressing} onPressOut={togglePressing}>
      <Animated.View
        style={[$rectangle, $pressingAnimation, animatedStyle, { backgroundColor: item.color }]}
      />
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
