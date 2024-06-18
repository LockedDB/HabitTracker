import {
  Canvas,
  Group,
  Image,
  RoundedRect,
  Shader,
  Skia,
  processTransform3d,
  useImage,
} from "@shopify/react-native-skia"
import { observer } from "mobx-react-lite"
import React from "react"
import { Dimensions, View, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated"

const source = Skia.RuntimeEffect.Make(`
vec4 main(vec2 pos) {
  // normalized x,y values go from 0 to 1, the canvas is 256x256
  vec2 normalized = pos/vec2(256);
  return vec4(normalized.x, normalized.y, 0.5, 1);
}`)!

const sf = 300 // scaling factor
const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.8
const CARD_HEIGHT = CARD_WIDTH * 1.5

const rct = Skia.XYWHRect(
  (width - CARD_WIDTH) / 2,
  (height - CARD_HEIGHT) / 2,
  CARD_WIDTH,
  CARD_HEIGHT,
)
const rrct = Skia.RRectXY(rct, 32, 32)

const dumbbells = require("../../assets/images/dumbbells.png")

export const PlaygroundScreen = observer(function PlaygroundScreen() {
  const image = useImage(dumbbells)

  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)

  const gesture = Gesture.Pan()
    .onChange((e) => {
      rotateY.value += e.changeX / sf
      rotateX.value -= e.changeY / sf
    })
    .onEnd(() => {
      rotateX.value = withTiming(0)
      rotateY.value = withTiming(0)
    })

  const matrix = useDerivedValue(() =>
    processTransform3d([
      { translate: [width / 2, height / 2] },
      { perspective: 500 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-width / 2, -height / 2] },
    ]),
  )

  return (
    <View style={$root}>
      <GestureDetector gesture={gesture}>
        <Canvas style={$canvas}>
          <Image image={image} x={0} y={0} width={width} height={height} fit="cover" />
          <Group matrix={matrix}>
            <Shader source={source} />
            <RoundedRect rect={rrct} x={width / 2} y={height / 2} />
          </Group>
        </Canvas>
      </GestureDetector>
    </View>
  )
})

const $canvas: ViewStyle = {
  flex: 1,
}

const $root: ViewStyle = {
  flex: 1,
}
