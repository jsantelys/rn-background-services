import {
  ConfigPlugin,
  createRunOncePlugin,
  withInfoPlist,
} from 'expo/config-plugins';

const pkg = require('../../package.json');

type RnBackgroundServicesPluginProps = {
  taskIdentifiers?: string[];
};

const PROCESSING_MODE = 'processing';
const PRODUCT_BUNDLE_IDENTIFIER = '$(PRODUCT_BUNDLE_IDENTIFIER)';

function withBackgroundModes(config: Parameters<typeof withInfoPlist>[0]) {
  return withInfoPlist(config, (config) => {
    const modes = normalizeStringArray(config.modResults.UIBackgroundModes);

    config.modResults.UIBackgroundModes = dedupeStrings([
      ...modes,
      PROCESSING_MODE,
    ]);

    return config;
  });
}

const withRnBackgroundServices: ConfigPlugin<RnBackgroundServicesPluginProps> = (
  config,
  props = {}
) => {
  const bundleIdentifier =
    config.ios?.bundleIdentifier ?? PRODUCT_BUNDLE_IDENTIFIER;
  const taskIdentifiers = props.taskIdentifiers ?? [];

  config = withBackgroundModes(config);

  return withInfoPlist(config, (config) => {
    const permittedIdentifiers = normalizeStringArray(
      config.modResults.BGTaskSchedulerPermittedIdentifiers
    );

    config.modResults.BGTaskSchedulerPermittedIdentifiers = dedupeStrings([
      ...permittedIdentifiers,
      ...taskIdentifiers.map((identifier) =>
        resolveTaskIdentifier(identifier, bundleIdentifier)
      ),
    ]);

    return config;
  });
};

function resolveTaskIdentifier(identifier: string, bundleIdentifier: string) {
  if (
    identifier.startsWith(`${bundleIdentifier}.`) ||
    identifier.startsWith(`${PRODUCT_BUNDLE_IDENTIFIER}.`)
  ) {
    return identifier;
  }

  return `${bundleIdentifier}.${identifier}`;
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  return typeof value === 'string' ? [value] : [];
}

export default createRunOncePlugin(
  withRnBackgroundServices,
  pkg.name,
  pkg.version
);
