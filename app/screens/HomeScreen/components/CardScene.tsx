import { Canvas, Group, processTransform3d, useFonts } from "@shopify/react-native-skia"
import { Habit } from "app/models"
import { Theme, themeData } from "app/models/Theme"
import { colors, customFontsToLoad, spacing } from "app/theme"
import { atom, useAtomValue } from "jotai"
import React from "react"
import { Dimensions, ImageBackground, ImageStyle, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import { CardBackground } from "./CardBackground"
import { cardRadius } from "./consts"
import { HeaderSection, headerSectionParagraphHeight } from "./sections/Header.section"
import { RewardSection, rewardSectionHeight } from "./sections/Reward.section"
import { StreakSection } from "./sections/Streak.section"

const { width, height } = Dimensions.get("window")

const { PoetsenOne, ...quicksandFonts } = customFontsToLoad
const allFonts = {
  Poetsen: [PoetsenOne],
  Quicksand: Object.values(quicksandFonts),
}

type CardProps = {
  item: Habit
}

function _CardScene(props: CardProps) {
  const { item } = props
  const theme: Theme = themeData[item.theme]
  const headerHeight = useAtomValue(headerSectionParagraphHeight)
  const contentHeightValue = useAtomValue(contentHeight)

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

  const contentRotation = useDerivedValue(() =>
    processTransform3d([
      { translate: [CARD_WIDTH / 2, contentHeightValue / 2] },
      { perspective: 500 },
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { translate: [-CARD_WIDTH / 2, -contentHeightValue / 2] },
    ])
  )

  const customFontMgr = useFonts(allFonts)

  const STREAK_OFFSET_Y = headerHeight + spacing.lg
  const REWARD_OFFSET_Y = STREAK_OFFSET_Y + 24 + 16 + spacing.xxl

  return (
    <AnimatedImageBackground
      source={theme.image}
      imageStyle={{ borderRadius: cardRadius }}
      style={$cardEffects}
    >
      <GestureDetector gesture={gesture}>
        <Canvas style={$canvas}>
          <Group matrix={rotationMatrix}>
            <CardBackground backgroundImage={theme.image} />
          </Group>
        </Canvas>
      </GestureDetector>

      <Canvas
        pointerEvents="none"
        style={[$content, {
          height: contentHeightValue,
          top: (height - contentHeightValue) / 2
        }]}
      >
        <Group matrix={contentRotation}>
          <HeaderSection
            x={spacing.md}
            y={spacing.lg}
            customFontMgr={customFontMgr}
            themeColor={theme.color}
            habit={{ ...item }}
          />

          <StreakSection
            x={spacing.md}
            y={STREAK_OFFSET_Y}
            themeColor={theme.color}
            themeIcon={theme.icon}
          />

          {item.reward && (
            <RewardSection x={spacing.md} y={REWARD_OFFSET_Y} customFontMgr={customFontMgr} />
          )}
        </Group>
      </Canvas>
    </AnimatedImageBackground >
  )
}

const streakHeight = spacing.lg + 64 + spacing.xl

const contentHeight = atom(
  (get) => get(headerSectionParagraphHeight) + streakHeight + get(rewardSectionHeight),
)

export const CARD_WIDTH = width * 0.8
export const CARD_HEIGHT = CARD_WIDTH * 1.5

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
  position: 'relative'
}

const $content: ViewStyle = {
  position: 'absolute',
  width: CARD_WIDTH,
  left: (width - CARD_WIDTH) / 2,
}
