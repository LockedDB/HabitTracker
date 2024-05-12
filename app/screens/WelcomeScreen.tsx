import { Button, Screen, Toggle } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "../navigators"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen() {
  const rootStore = useStores()

  // 1. Load habits ✅
  // 2. Display habits with a checkbox to save the date in the dates array ✅
  // 3. Store the results in async storage or mmkv (whatever is better for the use case) ✅
  // 4. Load the app and the previously modified habits are there ✅

  const createHabit = () => {
    rootStore.addHabit({
      name: "Test",
      dates: [],
      streak: 0,
    })
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={$screenStyle}>
      {rootStore.habits.map(({ name, isTodayChecked, toggle }, index) => (
        <Toggle
          label={name}
          key={index}
          containerStyle={$toggleContainer}
          value={isTodayChecked}
          onValueChange={toggle}
        />
      ))}
      <Button preset="default" onPress={createHabit}>
        Create a new habit
      </Button>
    </Screen>
  )
})

const $screenStyle: ViewStyle = {
  paddingHorizontal: spacing.md,
}

const $toggleContainer: ViewStyle = {
  marginBottom: spacing.md,
}
