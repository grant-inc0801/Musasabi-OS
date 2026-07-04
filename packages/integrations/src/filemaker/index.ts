export * from "./types";
export { RealFileMakerDataApiAdapter } from "./RealFileMakerDataApiAdapter";
export { MockFileMakerAdapter } from "./MockFileMakerAdapter";
export {
  fromFileMakerRecord,
  toFileMakerFieldData,
  DEFAULT_LEAD_FIELD_MAPPING,
  DEFAULT_STATUS_MAPPING,
} from "./LeadFieldMapper";
export type { LeadFieldMapping } from "./LeadFieldMapper";
