import { Canvas, Group, processTransform3d, useFonts } from "@shopify/react-native-skia"
import { Habit } from "app/models"
import { Theme, themeData } from "app/models/Theme"
import { colors, customFontsToLoad, spacing } from "app/theme"
import React, { useEffect, useMemo, useState } from "react"
import { Dimensions, ImageBackground, ImageStyle, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"
import { CardBackground } from "./CardBackground"
import { cardRadius } from "./consts"
import { HeaderSection } from "./sections/Header.section"
import { RewardSection } from "./sections/Reward.section"
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

function CardSceneComponent(props: CardProps) {
  const { item } = props
  const theme: Theme = themeData[item.theme]
  const [headerHeight, setHeaderHeight] = useState(0)
  const [rewardHeight, setRewardHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (headerHeight === 0) return
    setContentHeight(headerHeight + STREAK_CALC_HEIGHT + rewardHeight)
  }, [headerHeight, rewardHeight])

  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)

  const panGesture = Gesture.Pan()
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
      { translate: [CARD_WIDTH / 2, contentHeight / 2] },
      { perspective: 500 },
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { translate: [-CARD_WIDTH / 2, -contentHeight / 2] },
    ])
  )

  const customFontMgr = useFonts(allFonts)

  const streakOffsetY = useMemo(() => headerHeight + spacing.lg, [headerHeight])
  const rewardOffsetY = useMemo(() => streakOffsetY + 24 + 16 + spacing.xxl, [streakOffsetY])

  return (
    <AnimatedImageBackground
      source={theme.image}
      imageStyle={{ borderRadius: cardRadius }}
      style={$cardEffects}
    >
      <GestureDetector gesture={panGesture}>
        <Canvas style={$canvas}>
          <Group matrix={rotationMatrix}>
            <CardBackground backgroundImage={theme.image} />
          </Group>
        </Canvas>
      </GestureDetector>

      <Canvas
        pointerEvents="none"
        style={[$content, {
          height: contentHeight,
          top: (height - contentHeight) / 2
        }]}
      >
        <Group matrix={contentRotation}>
          <HeaderSection
            setHeight={setHeaderHeight}
            x={spacing.md}
            y={spacing.lg}
            customFontMgr={customFontMgr}
            themeColor={theme.color}
            habit={{ ...item }}
          />

          <StreakSection
            x={spacing.md}
            y={streakOffsetY}
            themeColor={theme.color}
            themeIcon={theme.icon}
          />

          {item.reward && (
            <RewardSection setHeight={setRewardHeight} x={spacing.md} y={rewardOffsetY} customFontMgr={customFontMgr} />
          )}
        </Group>
      </Canvas>
    </AnimatedImageBackground >
  )
}

export const STREAK_CALC_HEIGHT = spacing.lg + 64 + spacing.xl

export const CARD_WIDTH = width * 0.8
export const CARD_HEIGHT = CARD_WIDTH * 1.5

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)
export const CardScene = React.memo(CardSceneComponent)

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
