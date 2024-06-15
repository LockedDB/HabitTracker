import { Paragraph, SkTypefaceFontProvider, Skia, Text, useFont } from "@shopify/react-native-skia"
import { colors, customFontsToLoad } from "app/theme"
import withGroupTransform from "app/utils/skia/withGroupTransform"
import React, { useMemo } from "react"
import { CARD_WIDTH } from "../CardScene"

interface Props {
  customFontMgr: SkTypefaceFontProvider | null
}

function _RewardSection({ customFontMgr }: Props) {
  const titleFont = useFont(customFontsToLoad.quicksandBold, 16)

  const rewardParagraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) return null

    const bodyStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(bodyStyle)
      .addText("I will put 5€ into an account to pay for courses.")
      .build()

    paragraphBuilder.layout(CARD_WIDTH)

    return paragraphBuilder
  }, [customFontMgr])

  return (
    <>
      <Text text="Reward" font={titleFont} x={0} />
      <Paragraph paragraph={rewardParagraph} x={0} y={16} width={CARD_WIDTH} />
    </>
  )
}

export const RewardSection = withGroupTransform(React.memo(_RewardSection))
