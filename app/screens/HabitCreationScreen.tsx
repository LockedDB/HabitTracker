import { Button, Screen, Text, TextField } from "app/components"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useState } from "react"
import { ViewStyle } from "react-native"

interface HabitCreationScreenProps extends AppStackScreenProps<"HabitCreation"> {}

export const HabitCreationScreen: FC<HabitCreationScreenProps> = observer(
  function HabitCreationScreen(_props) {
    const {
      navigation: { goBack },
    } = _props
    const rootStore = useStores()
    const [habit, setHabit] = useState("")

    const createHabit = useCallback(() => {
      rootStore.addHabit({ name: habit })
      goBack()
    }, [habit])

    return (
      <Screen style={$root} preset="scroll" safeAreaEdges={["top"]}>
        <Text preset="heading">Create a new habit</Text>
        <TextField
          value={habit}
          containerStyle={$habit}
          placeholder="Habit name"
          onChangeText={(value) => setHabit(value)}
        />
        <Button disabled={!habit} preset={!habit ? "filled" : "reversed"} onPress={createHabit}>
          Create new habit
        </Button>
      </Screen>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.md,
}

const $habit: ViewStyle = {
  marginTop: spacing.md,
  marginBottom: spacing.lg,
}
