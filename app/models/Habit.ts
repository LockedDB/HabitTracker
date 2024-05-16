import { generateUUID } from "app/utils/uuid"
import { isToday } from "date-fns"
import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const HabitModel = types
  .model("Habit")
  .props({
    id: types.optional(types.identifier, () => generateUUID()),
    name: types.string,
    dates: types.optional(types.array(types.Date), []),
    streak: types.optional(types.number, 0),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get count() {
      return self.dates.length
    },
    get isTodayChecked() {
      return self.dates.some((date) => isToday(date))
    },
  }))
  .actions((self) => ({
    toggle() {
      const today = new Date()
      if (self.isTodayChecked) {
        self.dates.replace(self.dates.filter((date) => !isToday(date)))
      } else {
        self.dates.push(today)
      }
    },
  }))

export interface Habit extends Instance<typeof HabitModel> {}
export interface HabitSnapshotOut extends SnapshotOut<typeof HabitModel> {}
export interface HabitSnapshotIn extends SnapshotIn<typeof HabitModel> {}
export const createHabitDefaultModel = () =>
  types.optional(HabitModel, {
    id: "0",
    name: "",
    streak: 0,
    dates: [],
  })
