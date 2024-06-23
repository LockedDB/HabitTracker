import { BlendColor, Group, Image, Text, useFont, useImage } from "@shopify/react-native-skia"
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

  const titleFont = useFont(customFontsToLoad.quicksandBold, titleSize)
  const dayFont = useFont(customFontsToLoad.PoetsenOne, daySize)

  return (
    <>
      <Text font={titleFont} y={titleSize} text={"Streak"} />
      <Group transform={[{ translate: [0, titleSize + spacing.xs] }]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Group key={i}>
            <Image
              image={i < 3 ? iconActive : iconInactive}
              width={iconSize}
              height={iconSize}
              x={i * cardUsableSpacePerDay}
            >
              <BlendColor color={themeColor} mode="srcIn" />
            </Image>

            <Text
              text={days[i]}
              font={dayFont}
              x={i * cardUsableSpacePerDay + iconSize / 2 - daySize / 2}
              y={iconSize + spacing.xs + daySize}
            />
          </Group>
        ))}
      </Group>
    </>
  )
}

export const StreakSection = withGroupTransform(React.memo(_StreakSection))

const titleSize = 16
const iconSize = 24
const daySize = 8
const days = ["M", "T", "W", "T", "F", "S", "S"]

const cardWidthSpacing = spacing.md
const cardUsableSpace = CARD_WIDTH - cardWidthSpacing
const cardUsableSpacePerDay = cardUsableSpace / 7

export const streakSectionHeight = titleSize + spacing.xs + iconSize + spacing.xs + daySize
