import RnBackgroundServicesModule from './RnBackgroundServicesModule';

export function getBackgroundServicesAvailability() {
    return RnBackgroundServicesModule.getBackgroundServicesAvailability();
}

export async function getPermissionsAsync() {
    return await RnBackgroundServicesModule.getPermissionsAsync();
}

export async function requestPermissionsAsync() {
    return await RnBackgroundServicesModule.requestPermissionsAsync();
}

export function registerService(identifier: string, channelName: string) {
    try {
        return RnBackgroundServicesModule.registerService(identifier, channelName);
    } catch (error) {
        console.error('Error registering service, make sure the service is registered only once during runtime and is declared in the Info.plist file', error);
        return {
            success: false,
            reason: error instanceof Error ? error.message : String(error),
        };
    }
}

export function startService(identifier: string, title: string, subtitle: string) {
    try {
        return RnBackgroundServicesModule.startService(identifier, title, subtitle);
    } catch (error) {
        console.error('Error starting service, make sure the service is registered first before starting it', error);
        return {
            success: false,
            reason: error instanceof Error ? error.message : String(error),
        };
    }
}

export function stopService(success: boolean) {
    RnBackgroundServicesModule.stopService(success);
}

export function setCurrentTaskProgress(progress: number) {
    RnBackgroundServicesModule.setCurrentTaskProgress(progress);
}
