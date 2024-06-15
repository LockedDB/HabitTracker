/* eslint-disable react/display-name */
import { Group } from "@shopify/react-native-skia"
import React from "react"

interface WithGroupTransformProps {
  x?: number
  y?: number
}

const withGroupTransform = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P & WithGroupTransformProps> => {
  return ({ x, y, ...props }: WithGroupTransformProps) => {
    return (
      <Group transform={[{ translate: [x ?? 0, y ?? 0] }]}>
        <WrappedComponent {...(props as P)} />
      </Group>
    )
  }
}

export default withGroupTransform
