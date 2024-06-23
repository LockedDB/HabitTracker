import { Canvas, Group, processTransform3d, useFonts } from "@shopify/react-native-skia"
import { Habit } from "app/models"
import { Theme, themeData } from "app/models/Theme"
import { colors, customFontsToLoad, spacing } from "app/theme"
import React, { useEffect, useMemo, useState } from "react"
import { Dimensions, ImageBackground, ImageStyle, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { CardBackground } from "./CardBackground"
import { cardRadius } from "./consts"
import { AlarmSection, alarmSectionHeight } from "./sections/Alarms.section"
import { HeaderSection } from "./sections/Header.section"
import { RewardSection } from "./sections/Reward.section"
import { StreakSection, streakSectionHeight } from "./sections/Streak.section"

const { width, height } = Dimensions.get("window")

const { PoetsenOne, ...quicksandFonts } = customFontsToLoad
const allFonts = {
  Poetsen: [PoetsenOne],
  Quicksand: Object.values(quicksandFonts),
}

type CardProps = {
  item: Habit
  isVisible: boolean
}

function CardSceneComponent(props: CardProps) {
  const { item, isVisible } = props
  const theme: Theme = themeData[item.theme]
  const [headerHeight, setHeaderHeight] = useState(0)
  const [rewardHeight, setRewardHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)

  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)
  const currentRotation = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onChange((e) => {
      rotateY.value += e.changeX / 1000
      rotateX.value -= e.changeY / 1000
    })
    .onEnd((e) => {
      const isSignificantTranslation = Math.abs(e.velocityX) > 350
      if (isSignificantTranslation) {
        const direction = e.translationX > 0 ? 1 : -1
        currentRotation.value += direction * Math.PI
        rotateY.value = withSpring(currentRotation.value, { duration: 1000 }, () => {
          // If the rotation wants to go past the thresold let's reset it
          if (Math.abs(currentRotation.value) === Math.PI * 2) {
            rotateY.value = 0
            currentRotation.value = 0
          }
        })
        rotateX.value = withTiming(0)
      } else {
        rotateX.value = withTiming(0)
        rotateY.value = withTiming(0)
      }
    })

  const isDisplayingBack = useDerivedValue(() => {
    const absRotate = Math.abs(rotateY.value)
    if (absRotate > Math.PI / 2 && absRotate < (3 * Math.PI) / 2) {
      return true
    }
    return false
  })

  const rotationMatrix = useDerivedValue(() =>
    processTransform3d([
      { translate: [CENTER_X, CENTER_Y] },
      { perspective: 500 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-CENTER_X, -CENTER_Y] },
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
      { translate: [-(CARD_WIDTH / 2), -contentHeight / 2] },
    ]),
  )

  const customFontMgr = useFonts(allFonts)

  const streakOffsetY = useMemo(() => headerHeight + spacing.xs, [headerHeight])
  const rewardOffsetY = useMemo(
    () => streakOffsetY + streakSectionHeight + spacing.xs,
    [streakOffsetY],
  )
  const alarmOffsetY = useMemo(() => item.reward ? rewardOffsetY + rewardHeight + spacing.xs : streakOffsetY + streakSectionHeight + spacing.xs, [rewardOffsetY, streakOffsetY, item.reward, rewardHeight])

  const $flippedStyle = useAnimatedStyle(() => ({
    opacity: isDisplayingBack.value ? 0 : 1,
  }))

  useEffect(() => {
    if (headerHeight === 0) return
    const height =
      headerHeight +
      streakSectionHeight +
      rewardHeight +
      alarmSectionHeight +
      // Spacing between sections
      spacing.xs +
      spacing.xs +
      spacing.xs

    setContentHeight(height)
  }, [headerHeight, rewardHeight])

  useEffect(() => {
    if (isVisible) {
      rotateY.value = 0
      currentRotation.value = 0
    }
  }, [isVisible])

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

      <AnimatedCanvas
        pointerEvents="none"
        style={[
          $content,
          $flippedStyle,
          {
            height: contentHeight,
            top: (height - contentHeight) / 2,
          },
        ]}
      >
        <Group matrix={contentRotation}>
          <HeaderSection
            setHeight={setHeaderHeight}
            x={spacing.md}
            y={0}
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
            <RewardSection
              setHeight={setRewardHeight}
              x={spacing.md}
              y={rewardOffsetY}
              customFontMgr={customFontMgr}
            />
          )}

          <AlarmSection x={spacing.md} y={alarmOffsetY} />
        </Group>
      </AnimatedCanvas>
    </AnimatedImageBackground>
  )
}

export const CARD_WIDTH = width * 0.8
export const CARD_HEIGHT = CARD_WIDTH * 1.5

const CENTER_X = (width - CARD_WIDTH) / 2 + CARD_WIDTH / 2
const CENTER_Y = (CARD_HEIGHT + spacing.xxl) / 2

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)
const AnimatedCanvas = Animated.createAnimatedComponent(Canvas)
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
  position: "relative",
}

const $content: ViewStyle = {
  position: "absolute",
  width: CARD_WIDTH,
  left: (width - CARD_WIDTH) / 2,
}
