import { Paragraph, SkTypefaceFontProvider, Skia, Text, useFont } from "@shopify/react-native-skia"
import { colors, customFontsToLoad, spacing } from "app/theme"
import withGroupTransform from "app/utils/skia/withGroupTransform"
import { atom, useSetAtom } from "jotai"
import React, { useMemo } from "react"
import { CARD_WIDTH } from "../CardScene"

interface Props {
  customFontMgr: SkTypefaceFontProvider | null
  themeColor: string
}

function _HeaderSection({ customFontMgr, themeColor }: Props) {
  const titleFont = useFont(customFontsToLoad.PoetsenOne, titleSize)
  const setHeight = useSetAtom(headerSectionParagraphHeight)

  const paragraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) return null

    const bodyStyle = {
      fontSize: 16,
      fontFamilies: ["Quicksand"],
      color: Skia.Color(colors.text),
    }

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(bodyStyle)
      .addText(
        "I will read a page every night after getting in bed so that I can become an inspired person.",
      )
      .build()

    // Call layout to calculate the height of the paragraph
    paragraphBuilder.layout(CARD_WIDTH)

    setHeight(paragraphBuilder.getHeight() + titleSize + spacing.xs)

    return paragraphBuilder
  }, [customFontMgr])

  return (
    <>
      <Text font={titleFont} text={"Be Inspired!"} color={themeColor} />
      <Paragraph paragraph={paragraph} x={0} y={spacing.xs} width={CARD_WIDTH - spacing.md} />
    </>
  )
}

export const HeaderSection = withGroupTransform(React.memo(_HeaderSection))

export const headerSectionParagraphHeight = atom(0)

const titleSize = 24
