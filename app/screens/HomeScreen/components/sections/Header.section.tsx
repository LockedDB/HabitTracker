import { Paragraph, SkTypefaceFontProvider, Skia, Text, useFont } from "@shopify/react-native-skia"
import { Habit } from "app/models"
import { colors, customFontsToLoad, spacing } from "app/theme"
import withGroupTransform from "app/utils/skia/withGroupTransform"
import React, { useMemo } from "react"
import { CARD_WIDTH } from "../CardScene"

type Props = {
  customFontMgr: SkTypefaceFontProvider | null
  themeColor: string
  habit: Pick<Habit, "name" | "description">
  setHeight: (height: number) => void
}

function _HeaderSection({
  customFontMgr,
  themeColor,
  habit: { name, description },
  setHeight,
}: Props) {
  const titleFont = useFont(customFontsToLoad.PoetsenOne, titleSize)

  const paragraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) return null

    const bodyStyle = {
      fontSize: 14,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(bodyStyle)
      .addText(description)
      .build()

    // Call layout to calculate the height of the paragraph
    paragraphBuilder.layout(paragraphMaxWidth)

    const height = titleSize + spacing.xs + paragraphBuilder.getHeight()
    setHeight(height)

    return paragraphBuilder
  }, [customFontMgr, description, setHeight])

  return (
    <>
      <Text font={titleFont} text={name} y={titleSize} x={0} color={themeColor} />
      <Paragraph paragraph={paragraph} x={0} y={titleSize + spacing.xs} width={paragraphMaxWidth} />
    </>
  )
}

export const HeaderSection = withGroupTransform(_HeaderSection)

const titleSize = 24
const paragraphMaxWidth = CARD_WIDTH - spacing.md * 2
