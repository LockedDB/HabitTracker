import {
  Quicksand_700Bold as quicksandBold,
  Quicksand_300Light as quicksandLight,
  Quicksand_500Medium as quicksandMedium,
  Quicksand_400Regular as quicksandRegular,
  Quicksand_600SemiBold as quicksandSemiBold,
} from "@expo-google-fonts/quicksand"
import {
  Canvas,
  Group,
  Paragraph,
  RoundedRect,
  Skia,
  processTransform3d,
  useFonts,
} from "@shopify/react-native-skia"
import { Habit } from "app/models"
import { themeData } from "app/models/Theme"
import { colors, spacing } from "app/theme"
import React, { useMemo } from "react"
import { Dimensions, ImageBackground, ImageStyle, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { cardRadius } from "./consts"

const { width, height } = Dimensions.get("window")

type CardProps = {
  item: Habit
  index: number
  scrollX: SharedValue<number>
  pressing: SharedValue<boolean>
  selectedIndex: SharedValue<number>
}

function CardScene(props: CardProps) {
  const { item, index, scrollX } = props
  const theme = themeData[item.theme]

  // const flip = useSharedValue(0)

  const $rScale = useAnimatedStyle(() => {
    // Define the range of scroll positions for the previous, current, and next card
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    // Define the scale values for the previous, current, and next card
    const outputRange = [0.3, 1, 0.3] // Scale is smaller for the previous
    const scale = interpolate(scrollX.value, inputRange, outputRange)
    return { transform: [{ scale }] }
  })

  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)

  const gesture = Gesture.Pan()
    .onChange((e) => {
      rotateY.value += e.changeX / 300
      rotateX.value -= e.changeY / 300
    })
    .onEnd(() => {
      rotateX.value = withTiming(0)
      rotateY.value = withTiming(0)
    })

  const matrix = useDerivedValue(() =>
    processTransform3d([
      { translate: [CARD_WIDTH / 2, CARD_HEIGHT / 2] },
      { perspective: 500 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-CARD_WIDTH / 2, -CARD_HEIGHT / 2] },
    ]),
  )

  const customFontMgr = useFonts({
    Poetsen: [require("../../../../assets/fonts/PoetsenOne-Regular.ttf")],
    Quicksand: [
      quicksandBold,
      quicksandLight,
      quicksandMedium,
      quicksandRegular,
      quicksandSemiBold,
    ],
  })

  const paragraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) return null

    const titleStyle = {
      fontSize: 24,
      fontFamilies: ["Poetsen"],
      color: Skia.Color(theme.color),
    }

    const bodyStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
    paragraphBuilder
      .pushStyle(titleStyle)
      .addText("Be Inspired!")
      .pop()
      .pushStyle(bodyStyle)
      .addText(
        "I will read a page every night after getting in bed so that I can become an inspired person.",
      )
      .pop()
      .build()

    return paragraphBuilder.build()
  }, [customFontMgr])

  return (
    <AnimatedImageBackground
      source={theme.image}
      imageStyle={{ borderRadius: cardRadius }}
      style={[$cardEffects, $rScale]}
    >
      <GestureDetector gesture={gesture}>
        <Canvas style={$canvas}>
          <Group matrix={matrix}>
            <RoundedRect rect={rrct} x={width / 2} y={height / 2} color="white" />
            <Paragraph
              paragraph={paragraph}
              x={SPACING_LEFT + spacing.md}
              y={spacing.md}
              width={CARD_WIDTH}
            />
          </Group>
        </Canvas>
      </GestureDetector>
      {/*       <Animated.View pointerEvents="none" style={[$overlay, overlayStyle]}>
        <Front flip={flip} theme={theme} {...props} />
      </Animated.View> */}
    </AnimatedImageBackground>
  )
}

export const CARD_WIDTH = width * 0.8
export const CARD_HEIGHT = CARD_WIDTH * 1.5

const rct = Skia.XYWHRect((width - CARD_WIDTH) / 2, 0, CARD_WIDTH, CARD_HEIGHT)
const rrct = Skia.RRectXY(rct, 32, 32)

const SPACING_LEFT = (width - CARD_WIDTH) / 2
const SPACING_TOP = (height - CARD_HEIGHT) / 2

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

export const CardSceneMemo = React.memo(CardScene)

export const $root: ViewStyle = {
  flex: 1,
}

const $canvas: ViewStyle = {
  width,
  height: CARD_HEIGHT + spacing.xxl,
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
