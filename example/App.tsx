import { useMemo, useState } from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  getBackgroundServicesAvailability,
  getPermissionsAsync,
  registerService,
  requestPermissionsAsync,
  setCurrentTaskProgress,
  startService,
  stopService,
} from 'rn-background-services';

type ResultValue = string | null;

const DEFAULT_IDENTIFIER = 'background-processing-demo';
const DEFAULT_CHANNEL_NAME = 'Background processing';
const DEFAULT_TITLE = 'Sync in progress';
const DEFAULT_SUBTITLE = 'The task is running in the background';
const PROGRESS_PRESETS = [0, 25, 50, 75, 100];

export default function App() {
  const [identifier, setIdentifier] = useState(DEFAULT_IDENTIFIER);
  const [channelName, setChannelName] = useState(DEFAULT_CHANNEL_NAME);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [progress, setProgress] = useState('50');
  const [lastResult, setLastResult] = useState<ResultValue>(null);

  const platformNotes = useMemo(() => {
    if (Platform.OS === 'android') {
      return 'Android: register the notification channel first, then start the foreground service. The example also registers a headless JS task that updates progress automatically.';
    }

    if (Platform.OS === 'ios') {
      return 'iOS: the permission actions report feature availability for BGContinuedProcessingTask. This API requires iOS 26.0 or later and proper app configuration.';
    }

    return 'This example is intended for Android and iOS native builds.';
  }, []);

  function formatResult(label: string, value: unknown) {
    setLastResult(`${label}\n${JSON.stringify(value, null, 2)}`);
  }

  function runSafely(label: string, action: () => unknown) {
    try {
      formatResult(label, action());
    } catch (error) {
      formatResult(label, {
        success: false,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function runAsyncSafely(label: string, action: () => Promise<unknown>) {
    try {
      formatResult(label, await action());
    } catch (error) {
      formatResult(label, {
        success: false,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function handleSetProgress(value: number) {
    setProgress(String(value));
    runSafely(`setCurrentTaskProgress(${value})`, () => {
      setCurrentTaskProgress(value);
      return { success: true, progress: value };
    });
  }

  function handleCustomProgress() {
    const parsed = Number.parseInt(progress, 10);

    if (Number.isNaN(parsed)) {
      formatResult('setCurrentTaskProgress', {
        success: false,
        reason: 'Progress must be a valid integer.',
      });
      return;
    }

    handleSetProgress(parsed);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>rn-background-services example</Text>
        <Text style={styles.subtitle}>
          Use these controls to exercise the module API in a native build.
        </Text>

        <Card title="Platform notes">
          <Text style={styles.note}>{platformNotes}</Text>
        </Card>

        <Card title="Service configuration">
          <Field
            label="Identifier"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
          <Field
            label="Android channel name"
            value={channelName}
            onChangeText={setChannelName}
          />
          <Field label="Notification title" value={title} onChangeText={setTitle} />
          <Field
            label="Notification subtitle"
            value={subtitle}
            onChangeText={setSubtitle}
          />
        </Card>

        <Card title="Checks">
          <ActionButton
            title="Check availability"
            onPress={() =>
              runSafely('getBackgroundServicesAvailability', () =>
                getBackgroundServicesAvailability()
              )
            }
          />
          <ActionButton
            title="Get permissions"
            onPress={() =>
              runAsyncSafely('getPermissionsAsync', () => getPermissionsAsync())
            }
          />
          <ActionButton
            title="Request permissions"
            onPress={() =>
              runAsyncSafely('requestPermissionsAsync', () => requestPermissionsAsync())
            }
          />
        </Card>

        <Card title="Service lifecycle">
          <ActionButton
            title="Register service"
            onPress={() =>
              runSafely('registerService', () =>
                registerService(identifier.trim(), channelName.trim())
              )
            }
          />
          <ActionButton
            title="Start service"
            onPress={() =>
              runSafely('startService', () =>
                startService(identifier.trim(), title.trim(), subtitle.trim())
              )
            }
          />
          <ActionButton
            title="Stop service (success)"
            onPress={() =>
              runSafely('stopService(true)', () => {
                stopService(true);
                return { success: true };
              })
            }
          />
          <ActionButton
            title="Stop service (failure)"
            onPress={() =>
              runSafely('stopService(false)', () => {
                stopService(false);
                return { success: true };
              })
            }
          />
        </Card>

        <Card title="Progress controls">
          <Field
            label="Custom progress"
            value={progress}
            onChangeText={setProgress}
            keyboardType="number-pad"
          />
          <ActionButton title="Set custom progress" onPress={handleCustomProgress} />
          <View style={styles.progressRow}>
            {PROGRESS_PRESETS.map((value) => (
              <View key={value} style={styles.progressButton}>
                <Button title={`${value}%`} onPress={() => handleSetProgress(value)} />
              </View>
            ))}
          </View>
        </Card>

        <Card title="Last result">
          <Text style={styles.result}>
            {lastResult ?? 'No actions run yet.'}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{props.title}</Text>
      {props.children}
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
        keyboardType={props.keyboardType ?? 'default'}
        onChangeText={props.onChangeText}
        style={styles.input}
        value={props.value}
      />
    </View>
  );
}

function ActionButton(props: { title: string; onPress: () => void }) {
  return (
    <View style={styles.button}>
      <Button title={props.title} onPress={props.onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4ef',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17211f',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#46524f',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    gap: 12,
    borderWidth: 1,
    borderColor: '#d7ddd8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#17211f',
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: '#46524f',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#31403c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b9c4be',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#17211f',
    backgroundColor: '#fbfcfa',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressButton: {
    minWidth: 76,
  },
  result: {
    fontSize: 13,
    lineHeight: 19,
    color: '#1f2d29',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});
