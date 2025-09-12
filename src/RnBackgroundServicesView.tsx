import { requireNativeView } from 'expo';
import * as React from 'react';

import { RnBackgroundServicesViewProps } from './RnBackgroundServices.types';

const NativeView: React.ComponentType<RnBackgroundServicesViewProps> =
  requireNativeView('RnBackgroundServices');

export default function RnBackgroundServicesView(props: RnBackgroundServicesViewProps) {
  return <NativeView {...props} />;
}
