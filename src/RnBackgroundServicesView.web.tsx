import * as React from 'react';

import { RnBackgroundServicesViewProps } from './RnBackgroundServices.types';

export default function RnBackgroundServicesView(props: RnBackgroundServicesViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
