import { Button, Screen, Text, Toggle } from "app/components"
import { useStores } from "app/models"
import { spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "../navigators"

interface WelcomeScreenProps extends AppStackScreenProps<"Welcome"> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = observer(function WelcomeScreen(_props) {
  const { navigation } = _props
  const rootStore = useStores()

  const createHabit = () => {
    navigation.navigate("HabitCreation")
  }

  const navigateToCards = () => {
    navigation.navigate("Home")
  }

  const navigateToPlayground = () => {
    navigation.navigate("Playground")
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={$screenStyle}>
      <Text style={$title} preset="heading">
        List of habits
      </Text>
      {rootStore.habits.map((habit, index) => (
        <Toggle
          label={habit.name}
          key={index}
          containerStyle={$toggleContainer}
          value={habit.isTodayChecked}
          onValueChange={habit.toggle}
        />
      ))}
      <View style={$buttonContainer}>
        <Button preset="default" onPress={createHabit}>
          Create a new habit
        </Button>
        <Button preset="reversed" onPress={navigateToCards}>
          Go home
        </Button>
        <Button preset="reversed" onPress={navigateToPlayground}>
          Go Playground
        </Button>
      </View>
    </Screen>
  )
})

const $title: ViewStyle = {
  marginBottom: spacing.md,
}

const $screenStyle: ViewStyle = {
  paddingHorizontal: spacing.md,
}

const $toggleContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $buttonContainer: ViewStyle = {
  gap: spacing.md,
}
