import { HabitModel, createHabitDefaultModel } from "./Habit"

test("can be created", () => {
  const instance = HabitModel.create(createHabitDefaultModel().create())

  expect(instance).toBeTruthy()
})
