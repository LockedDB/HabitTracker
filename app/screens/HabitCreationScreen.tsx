import { Button, Screen, TextField } from "app/components"
import { useStores } from "app/models"
import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { useHeader } from "app/utils/useHeader"
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useState } from "react"
import { View, ViewStyle } from "react-native"

interface HabitCreationScreenProps extends AppStackScreenProps<"HabitCreation"> {}

export const HabitCreationScreen: FC<HabitCreationScreenProps> = observer(
  function HabitCreationScreen(_props) {
    const {
      navigation: { goBack },
    } = _props
    const rootStore = useStores()
    const [habit, setHabit] = useState("")
    const [when, setWhen] = useState("")
    const [identity, setIdentity] = useState("")

    useHeader({
      title: "New habit",
      leftIcon: "back",
      onLeftPress: goBack,
    })

    const createHabit = useCallback(() => {
      rootStore.addHabit({ name: habit })
      goBack()
    }, [habit])

    return (
      <>
        <Screen
          style={$root}
          contentContainerStyle={$content}
          preset="fixed"
          safeAreaEdges={["bottom"]}
        >
          <View />
          <View style={$fieldsContainer}>
            <TextField
              value={habit}
              placeholder="put on my gym clothes"
              label="I will..."
              onChangeText={(value) => setHabit(value)}
            />
            <TextField
              value={when}
              placeholder="every morning at 7am"
              label="When..."
              onChangeText={(value) => setWhen(value)}
            />
            <TextField
              value={identity}
              label="So that I can become"
              placeholder="a healthier person"
              onChangeText={(value) => setIdentity(value)}
            />
          </View>
          <Button disabled={!habit} preset={!habit ? "filled" : "reversed"} onPress={createHabit}>
            New habit
          </Button>
        </Screen>
      </>
    )
  },
)

const $root: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.md,
  justifyContent: "space-between",
}

const $fieldsContainer: ViewStyle = {
  gap: spacing.md,
}
