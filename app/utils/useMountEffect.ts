import { EffectCallback, useEffect } from "react"

export function useMountEffect(fn: EffectCallback) {
  useEffect(fn, [])
}
