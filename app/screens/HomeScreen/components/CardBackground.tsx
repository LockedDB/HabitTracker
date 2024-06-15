import { RoundedRect, Skia } from "@shopify/react-native-skia"
import { colors } from "app/theme"
import React from "react"
import { Dimensions } from "react-native"
import { CARD_HEIGHT, CARD_WIDTH } from "./CardScene"

const { width } = Dimensions.get("window")

const rct = Skia.XYWHRect((width - CARD_WIDTH) / 2, 0, CARD_WIDTH, CARD_HEIGHT)
const rrct = Skia.RRectXY(rct, 32, 32)

export function CardBackground() {
  return <RoundedRect rect={rrct} color={colors.background} />
}
