import { Paragraph, SkTypefaceFontProvider, Skia, Text, useFont } from "@shopify/react-native-skia"
import { colors, customFontsToLoad, spacing } from "app/theme"
import withGroupTransform from "app/utils/skia/withGroupTransform"
import React, { useMemo } from "react"
import { CARD_WIDTH } from "../CardScene"

type Props = {
  customFontMgr: SkTypefaceFontProvider | null
}

function _RewardSection({ customFontMgr }: Props) {
  const titleFont = useFont(customFontsToLoad.quicksandBold, 16)

  const rewardParagraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) return null

    const bodyStyle = {
      fontSize: 14,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(bodyStyle)
      .addText("I will put 5€ into an account to pay for courses.")
      .build()

    paragraphBuilder.layout(CARD_WIDTH - spacing.md * 2)

    return paragraphBuilder
  }, [customFontMgr])

  return (
    <>
      <Text text="Reward" font={titleFont} x={0} />
      <Paragraph paragraph={rewardParagraph} x={0} y={16} width={CARD_WIDTH - spacing.md * 2} />
    </>
  )
}

export const RewardSection = withGroupTransform(React.memo(_RewardSection))
