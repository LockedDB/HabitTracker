import { BlendColor, Image, Mask, RoundedRect, Skia, useImage } from "@shopify/react-native-skia"
import { Theme } from "app/models/Theme"
import { colors } from "app/theme"
import React from "react"
import { Dimensions } from "react-native"
import { CARD_HEIGHT, CARD_WIDTH } from "./CardScene"

type Props = {
  backgroundImage: Theme["image"]
}

export function CardBackground({ backgroundImage }: Props) {
  const image = useImage(backgroundImage)

  return (
    <Mask mode="alpha" mask={<RoundedRect rect={rrct} />}>
      <Image image={image} width={width} height={height} fit="cover" opacity={0.05}>
        <BlendColor color={colors.background} mode="darken" />
      </Image>
    </Mask>
  )
}

const { width, height } = Dimensions.get("window")

const rct = Skia.XYWHRect((width - CARD_WIDTH) / 2, 0, CARD_WIDTH, CARD_HEIGHT)
const rrct = Skia.RRectXY(rct, 32, 32)
