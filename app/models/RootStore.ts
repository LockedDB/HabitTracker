import { isUUID } from "app/utils/uuid"
import { toJS } from "mobx"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { HabitModel, HabitSnapshotIn } from "./Habit"

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model("RootStore")
  .props({
    habits: types.array(HabitModel),
  })
  .views((self) => ({
    get jsHabits() {
      return toJS(self.habits)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    addHabit(habit: HabitSnapshotIn) {
      const newHabit = HabitModel.create(habit)
      self.habits.push(newHabit)
    },
    toggleHabit(id: string) {
      if (!isUUID(id)) throw new Error("Invalid UUID")

      const habit = self.habits.find((habit) => habit.id === id)
      if (habit) {
        habit.toggle()
      }
    },
  }))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
