import {
  Fill,
  Group,
  Image,
  Paint,
  RuntimeShader,
  Shadow,
  Skia,
  useImage
} from "@shopify/react-native-skia"
import { Theme } from "app/models/Theme"
import { colors } from "app/theme"
import React from "react"
import { Dimensions } from "react-native"
import { CARD_HEIGHT, CARD_WIDTH } from "./CardScene"

type Props = {
  backgroundImage: Theme["image"]
}

// Shader to transform all the pixels to its luminosity
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {
  half4 color = image.eval(xy);
  half luminosity = dot(color.rgb, half3(0.299, 0.587, 0.114));
  return half4(luminosity, luminosity, luminosity, color.a);
}
`)!

export function CardBackground({ backgroundImage }: Props) {
  const image = useImage(backgroundImage)

  return (
    <Group
      clip={rrct}
      layer={
        <Paint>
          <Shadow dx={0} dy={0} blur={4} color="rgba(0, 0, 0, 0.15)" />
        </Paint>
      }
    >
      <RuntimeShader source={source} />
      <Fill color={colors.background} />
      <Image image={image} width={width} height={height} fit="cover" opacity={0.1} />
    </Group>
  )
}

const { width, height } = Dimensions.get("window")

const rct = Skia.XYWHRect((width - CARD_WIDTH) / 2, 0, CARD_WIDTH, CARD_HEIGHT)
const rrct = Skia.RRectXY(rct, 32, 32)
