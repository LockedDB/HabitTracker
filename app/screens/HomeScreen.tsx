import { Screen } from "app/components"
import { AppStackScreenProps } from "app/navigators"
import { colors } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useRef } from "react"
import { FlatList, View, ViewStyle, useWindowDimensions } from "react-native"
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
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
 */
export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen() {
  const scrollX = useSharedValue(0)
  const scrollViewRef = useRef<FlatList>(null)

  const [data, setData] = React.useState(rectangles)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
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
          <MemoizedItem item={item} index={index} scrollX={scrollX} />
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

const Item = ({
  item,
  index,
  scrollX,
}: {
  item: { id: string; color: string }
  index: number
  scrollX: SharedValue<number>
}) => {
  const { width: screenWidth } = useWindowDimensions()

  const $rectangleContainer: ViewStyle = {
    width: screenWidth,
    alignItems: "center",
    justifyContent: "center",
  }

  const $rectangle: ViewStyle = {
    width: screenWidth / 1.5,
    aspectRatio: 1 / 1.5,
    borderRadius: 4,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth]
    const outputRange = [0.5, 1, 0.5]

    return {
      transform: [
        {
          scale: interpolate(scrollX.value, inputRange, outputRange),
        },
      ],
    }
  })

  return (
    <View style={$rectangleContainer}>
      <Animated.View style={[$rectangle, animatedStyle, { backgroundColor: item.color }]} />
    </View>
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
