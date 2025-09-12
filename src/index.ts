// Reexport the native module. On web, it will be resolved to RnBackgroundServicesModule.web.ts
// and on native platforms to RnBackgroundServicesModule.ts
export { default } from './RnBackgroundServicesModule';
export { default as RnBackgroundServicesView } from './RnBackgroundServicesView';
export * from  './RnBackgroundServices.types';
