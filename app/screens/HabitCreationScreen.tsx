import { Button, Screen, TextField } from "app/components"
import { useStores } from "app/models"
import { HabitTheme } from "app/models/Theme"
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
    const [title, setTitle] = useState("")
    const [habit, setHabit] = useState("")
    const [when, setWhen] = useState("")
    const [identity, setIdentity] = useState("")
    const [theme, setTheme] = useState(HabitTheme.Astro)

    useHeader({
      title: "New habit",
      leftIcon: "back",
      onLeftPress: goBack,
    })

    const createHabit = useCallback(() => {
      rootStore.addHabit({
        name: title,
        description: `I will ${habit} every ${when} so that I can become ${identity}`,
        theme,
      })
      goBack()
    }, [habit, when, identity, theme, habit, title])

    return (
      <Screen
        style={$root}
        contentContainerStyle={$content}
        preset="fixed"
        keyboardOffset={120}
        safeAreaEdges={["bottom"]}
      >
        <View />
        <View style={$fieldsContainer}>
          <TextField
            value={title}
            placeholder="New habit"
            label="Title"
            autoCapitalize="none"
            onChangeText={(value) => setTitle(value)}
          />
          <TextField
            value={habit}
            placeholder="put on my gym clothes"
            label="I will..."
            autoCapitalize="none"
            onChangeText={(value) => setHabit(value)}
          />
          <TextField
            value={when}
            placeholder="every morning at 7am"
            label="When..."
            autoCapitalize="none"
            onChangeText={(value) => setWhen(value)}
          />
          <TextField
            value={identity}
            label="So that I can become"
            placeholder="a healthier person"
            autoCapitalize="none"
            onChangeText={(value) => setIdentity(value)}
          />
          <Button preset="reversed" onPress={() => setTheme(HabitTheme.Astro)}>
            Astro
          </Button>
          <Button preset="reversed" onPress={() => setTheme(HabitTheme.Sport)}>
            Sport
          </Button>
        </View>
        <Button
          disabled={!habit || !title}
          preset={!habit ? "filled" : "reversed"}
          onPress={createHabit}
        >
          New habit
        </Button>
      </Screen>
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
