import { BlendColor, Image, Text, useFont, useImage } from "@shopify/react-native-skia"
import { Theme } from "app/models/Theme"
import { customFontsToLoad, spacing } from "app/theme"
import withGroupTransform from "app/utils/skia/withGroupTransform"
import React from "react"
import { CARD_WIDTH } from "../CardScene"

type Props = {
  themeColor: string
  themeIcon: Theme["icon"]
}

function _StreakSection({ themeColor, themeIcon }: Props) {
  const iconActive = useImage(themeIcon.active)
  const iconInactive = useImage(themeIcon.inactive)

  const titleFont = useFont(customFontsToLoad.quicksandBold, 16)
  const dayFont = useFont(customFontsToLoad.PoetsenOne, 8)

  return (
    <>
      <Text font={titleFont} text={"Streak"} />
      {Array.from({ length: 7 }).map((_, i) => (
        <Image
          key={i}
          image={i < 3 ? iconActive : iconInactive}
          x={i * ((CARD_WIDTH - spacing.md) / 7)}
          y={8 + spacing.xs}
          width={24}
          height={24}
        >
          <BlendColor color={themeColor} mode="srcIn" />
        </Image>
      ))}
      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
        <Text
          key={i}
          text={day}
          x={i * ((CARD_WIDTH - spacing.md) / 7) + 8}
          y={16 + 24 + spacing.md}
          font={dayFont}
        />
      ))}
    </>
  )
}

export const StreakSection = withGroupTransform(React.memo(_StreakSection))
