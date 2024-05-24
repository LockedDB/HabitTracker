// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here
import {
  Quicksand_700Bold as quicksandBold,
  Quicksand_300Light as quicksandLight,
  Quicksand_500Medium as quicksandMedium,
  Quicksand_400Regular as quicksandRegular,
  Quicksand_600SemiBold as quicksandSemiBold,
} from "@expo-google-fonts/quicksand"
import { Platform } from "react-native"

export const customFontsToLoad = {
  quicksandBold,
  quicksandLight,
  quicksandMedium,
  quicksandRegular,
  quicksandSemiBold,
  PoetsenOne: require("../../assets/fonts/PoetsenOne-Regular.ttf"),
}

const fonts = {
  quicksand: {
    bold: "Quicksand-Bold",
    light: "Quicksand-Light",
    medium: "Quicksand-Medium",
    regular: "Quicksand-Regular",
    semiBold: "Quicksand-SemiBold",
  },
  poetsen: {
    regular: "PoetsenOne-Regular",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.quicksand,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: fonts.poetsen,
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
