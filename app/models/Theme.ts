// I need a structure to store the theme data for each habit

import { colors } from "app/theme"

export enum HabitTheme {
  Astro = "Astro",
  Sport = "Sport",
  /* Forest = "Forest",
    Autumn = "Autumn", */
}

export const themeData = {
  [HabitTheme.Astro]: {
    name: "Astro",
    color: colors.palette.astro,
    icon: {
      active: require("../../assets/icons/bling_fill.png"),
      inactive: require("../../assets/icons/bling_line.png"),
    },
    image: require("../../assets/images/astronauts.png"),
  },
  [HabitTheme.Sport]: {
    name: "Sport",
    icon: {
      active: require("../../assets/icons/barbell_fill.png"),
      inactive: require("../../assets/icons/barbell.png"),
    },
    color: colors.palette.sport,
    image: require("../../assets/images/dumbbells.png"),
  },
}

export type Theme = (typeof themeData)[keyof typeof themeData]
