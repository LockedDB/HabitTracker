import { colors } from "app/theme"
import * as React from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import Animated, {
  SharedValue,
  WithTimingConfig,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated"

export interface BackdropProps {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Toggle the visibility of the backdrop with an animation.
   */
  value: SharedValue<number>
  /**
   * Input range
   */
  inputRange: number[]
  /**
   * Output range
   */
  outputRange: number[]
  /**
   * The children of the backdrop.
   */
  children?: React.ReactNode
  /**
   * Animation configuration for the backdrop exiting
   */
  exitAnimationConfig?: WithTimingConfig
  /**
   * Animation configuration for the backdrop entering
   */
  enterAnimationConfig?: WithTimingConfig
}

/**
 * A dark backdrop that can be used to overlay content.
 */
export function Backdrop(props: BackdropProps) {
  const { style, children, value } = props

  const opacity = useDerivedValue(() =>
    interpolate(value.value, props.inputRange, props.outputRange),
  )

  const $rBackdrop = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const $styles = [$backdrop, style, $rBackdrop]

  return <Animated.View style={$styles}>{children}</Animated.View>
}

const $backdrop: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: colors.palette.neutral100,
}
