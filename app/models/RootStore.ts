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
  }))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
