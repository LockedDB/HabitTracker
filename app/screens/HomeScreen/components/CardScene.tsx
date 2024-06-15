import {
  Quicksand_700Bold as quicksandBold,
  Quicksand_300Light as quicksandLight,
  Quicksand_500Medium as quicksandMedium,
  Quicksand_400Regular as quicksandRegular,
  Quicksand_600SemiBold as quicksandSemiBold,
} from "@expo-google-fonts/quicksand"
import {
  BlendColor,
  Canvas,
  FontWeight,
  Group,
  Image,
  Paragraph,
  RoundedRect,
  Skia,
  Text,
  processTransform3d,
  useFont,
  useFonts,
  useImage,
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

const { width } = Dimensions.get("window")

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
      rotateY.value += e.changeX / 1000
      rotateX.value -= e.changeY / 1000
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
      // Since there is an offset in the y-axis, we need to move the card down half that offset
      { translateY: spacing.xxl / 2 },
    ]),
  )

  // Move the content to the center of the card
  const contentMatrix = useMemo(
    () => processTransform3d([{ translate: [0, (CARD_HEIGHT - CARD_WIDTH) / 2] }]),
    [],
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

    const subTitleStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      fontStyle: { weight: FontWeight.Bold },
      color: Skia.Color(colors.text),
    }

    const bodyStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(titleStyle)
      .addText("Be Inspired!")
      .pop()
      .pushStyle(bodyStyle)
      .addText(
        "\n\nI will read a page every night after getting in bed so that I can become an inspired person.",
      )
      .pop()
      .pushStyle(subTitleStyle)
      .addText("\n\nStreak")
      .pop()
      .build()

    // Call layout to calculate the height of the paragraph
    paragraphBuilder.layout(CARD_WIDTH)

    return paragraphBuilder
  }, [customFontMgr])

  const dayFont = useFont(require("../../../../assets/fonts/PoetsenOne-Regular.ttf"), 12)

  const textContainerHeight = paragraph?.getHeight() ?? 0

  const icon = useImage(require("../../../../assets/icons/bling_line.png"), (err) => {
    console.log("error", err)
  })

  const STREAK_OFFSET_Y = textContainerHeight + spacing.lg
  const REWARD_OFFSET_Y = STREAK_OFFSET_Y + 24 + 8 + spacing.xl

  const rewardParagraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) return null

    const rewardStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      fontStyle: { weight: FontWeight.Bold },
      color: Skia.Color(colors.text),
    }

    const bodyStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(rewardStyle)
      .addText("Reward")
      .pop()
      .pushStyle(bodyStyle)
      .addText("\n\nI will put 5€ into an account to pay for courses.")
      .build()

    paragraphBuilder.layout(CARD_WIDTH)

    return paragraphBuilder
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
            <RoundedRect rect={rrct} x={width / 2} y={0} color="white" />

            <Group matrix={contentMatrix}>
              <Paragraph
                paragraph={paragraph}
                x={SPACING_LEFT + spacing.md}
                y={0}
                width={CARD_WIDTH - spacing.md}
              />
              <Group transform={[{ translateX: SPACING_LEFT }, { translateY: STREAK_OFFSET_Y }]}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Image
                    key={i}
                    image={icon}
                    x={spacing.md + i * ((CARD_WIDTH - spacing.md) / 7)}
                    y={0}
                    width={24}
                    height={24}
                  >
                    <BlendColor color={theme.color} mode="srcIn" />
                  </Image>
                ))}
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <Text
                    key={i}
                    text={day}
                    x={spacing.md + i * ((CARD_WIDTH - spacing.md) / 7) + 7}
                    y={40}
                    font={dayFont}
                  />
                ))}
              </Group>

              <Group transform={[{ translateX: SPACING_LEFT }, { translateY: REWARD_OFFSET_Y }]}>
                <Paragraph paragraph={rewardParagraph} x={spacing.md} y={0} width={CARD_WIDTH} />
              </Group>
            </Group>
          </Group>
        </Canvas>
      </GestureDetector>
    </AnimatedImageBackground>
  )
}

export const CARD_WIDTH = width * 0.8
export const CARD_HEIGHT = CARD_WIDTH * 1.5

const rct = Skia.XYWHRect((width - CARD_WIDTH) / 2, 0, CARD_WIDTH, CARD_HEIGHT)
const rrct = Skia.RRectXY(rct, 32, 32)

const SPACING_LEFT = (width - CARD_WIDTH) / 2

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
