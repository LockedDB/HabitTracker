import { Canvas, Group, processTransform3d, useFonts } from "@shopify/react-native-skia"
import { Habit } from "app/models"
import { Theme, themeData } from "app/models/Theme"
import { colors, customFontsToLoad, spacing } from "app/theme"
import { useAtomValue } from "jotai"
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
import { CardBackground } from "./CardBackground"
import { cardRadius } from "./consts"
import { HeaderSection, headerSectionParagraphHeight } from "./sections/Header.section"
import { RewardSection } from "./sections/Reward.section"
import { StreakSection } from "./sections/Streak.section"

const { width } = Dimensions.get("window")

const { PoetsenOne, ...quicksandFonts } = customFontsToLoad
const allFonts = {
  Poetsen: [PoetsenOne],
  Quicksand: Object.values(quicksandFonts),
}

type CardProps = {
  item: Habit
  index: number
  scrollX: SharedValue<number>
  pressing: SharedValue<boolean>
  selectedIndex: SharedValue<number>
}

function _CardScene(props: CardProps) {
  const { item, index, scrollX } = props
  const theme: Theme = themeData[item.theme]
  const headerHeight = useAtomValue(headerSectionParagraphHeight)

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

  const rotationMatrix = useDerivedValue(() =>
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
    () =>
      processTransform3d([{ translate: [0, (CARD_HEIGHT - CARD_WIDTH) / 2 + spacing.xxl / 2] }]),
    [],
  )

  const customFontMgr = useFonts(allFonts)

  const STREAK_OFFSET_Y = headerHeight + spacing.lg
  const REWARD_OFFSET_Y = STREAK_OFFSET_Y + 24 + 16 + spacing.xxl

  return (
    <AnimatedImageBackground
      source={theme.image}
      imageStyle={{ borderRadius: cardRadius }}
      style={[$cardEffects, $rScale]}
    >
      <GestureDetector gesture={gesture}>
        <Canvas style={$canvas}>
          <Group matrix={rotationMatrix}>
            <CardBackground backgroundImage={theme.image} />
            <Group matrix={contentMatrix}>
              <HeaderSection
                x={SPACING_LEFT}
                y={spacing.lg}
                customFontMgr={customFontMgr}
                themeColor={theme.color}
                habit={{ ...item }}
              />

              <StreakSection
                x={SPACING_LEFT}
                y={STREAK_OFFSET_Y}
                themeColor={theme.color}
                themeIcon={theme.icon}
              />

              <RewardSection x={SPACING_LEFT} y={REWARD_OFFSET_Y} customFontMgr={customFontMgr} />
            </Group>
          </Group>
        </Canvas>
      </GestureDetector>
    </AnimatedImageBackground>
  )
}

export const CARD_WIDTH = width * 0.8
export const CARD_HEIGHT = CARD_WIDTH * 1.5

const SPACING_LEFT = (width - CARD_WIDTH) / 2 + spacing.md

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

export const CardScene = React.memo(_CardScene)

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
