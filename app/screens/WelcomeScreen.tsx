import { Button, Screen, Toggle } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "../navigators"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(_props) {
  const { navigation } = _props
  const rootStore = useStores()

  const createHabit = () => {
    navigation.navigate("HabitCreation")
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={$screenStyle}>
      {rootStore.habits.map((habit, index) => (
        <Toggle
          label={habit.name}
          key={index}
          containerStyle={$toggleContainer}
          value={habit.isTodayChecked}
          onValueChange={habit.toggle}
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
