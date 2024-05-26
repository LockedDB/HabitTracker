import { Canvas, Image, RoundedRect, Skia, useImage } from "@shopify/react-native-skia"
import { observer } from "mobx-react-lite"
import React from "react"
import { Dimensions, View, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useSharedValue } from "react-native-reanimated"

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width * 0.8
const CARD_HEIGHT = CARD_WIDTH * 1.5

const rct = Skia.XYWHRect(
  (width - CARD_WIDTH) / 2,
  (height - CARD_HEIGHT) / 2,
  CARD_WIDTH,
  CARD_HEIGHT,
)
const rrct = Skia.RRectXY(rct, 10, 10)

const dumbbells = require("../../assets/images/dumbbells.png")

export const PlaygroundScreen = observer(function PlaygroundScreen() {
  const image = useImage(dumbbells)

  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)

  const gesture = Gesture.Pan().onChange((e) => {
    rotateX.value += e.changeX
    rotateY.value -= e.changeY
  })

  return (
    <View style={$root}>
      <GestureDetector gesture={gesture}>
        <Canvas style={$canvas}>
          <Image image={image} x={0} y={0} width={width} height={height} fit="cover" />
          <RoundedRect rect={rrct} x={width / 2} y={height / 2} color="white" />
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
