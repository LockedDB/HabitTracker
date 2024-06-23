import { Group, Image, Text, useFont, useImage } from "@shopify/react-native-skia"
import { customFontsToLoad, spacing } from "app/theme"
import withGroupTransform from "app/utils/skia/withGroupTransform"
import React from "react"

const _AlarmSection = () => {
    const alarmFont = useFont(customFontsToLoad.quicksandBold, alarmFontSize)
    const clock = useImage(require("assets/icons/mdi_clock.png"))

    return Array.from({ length: 2 }, (_, index) => (
        <Group key={index}>
            <Image
                image={clock}
                x={index * (widthOfAnAlarm + spacing.sm)}
                y={1.5}
                width={alarmIconSize}
                height={alarmFontSize}
            />
            <Text
                text={`${index === 0 ? "8:00 AM" : "22:00 PM"}`}
                font={alarmFont}
                y={alarmFontSize}
                x={alarmIconSize + spacing.xxs + index * (widthOfAnAlarm + spacing.sm)}
                color="#A4A4A4"
            />
        </Group>
    ))
}

export const AlarmSection = withGroupTransform(React.memo(_AlarmSection))

const alarmFontSize = 12
const alarmIconSize = 10

// We'll assume all the alarms have the same width. As we cannot calculate the width of the text
const widthOfAnAlarm = 64

// TODO: If there are no alarms, this height is 0
export const alarmSectionHeight = 15
