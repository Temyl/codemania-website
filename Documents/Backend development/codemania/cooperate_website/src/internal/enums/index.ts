export enum DURATION {
  SECONDS = 1_000,
  MINUTES = 60 * SECONDS,
  HOURS = 60 * MINUTES,
  DAYS = 24 * HOURS,
}

export enum AppEnv {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
  TEST = "test",
}

export enum Role {
  USER = "user",
}

export enum category {
  STRATEGY = "strategy",
  DESIGN = "design",
  ENGINEERING = "engineering",
  DATA_PROCESSING = "data_processing",
  INNOVATION = "innovation"
}

export enum project_details {
  DIGITAL_PRODUCT_DESIGN = "digital_product_design",
  SOFTWARE_DEVELOPMENT = "software_development",
  CONSULTING_SERVICES = "consulting_services",
  CLOUDS_DEVOPS = "cloud_or_devops",
  IOT_SOLUTIONS = "IoT_solutions",
  CRM_ERP_DEVELOPMENT = "crm_or_erp_development" 
}

export enum FileSize {
  BYTE = 1,
  KB = 1_024 * BYTE,
  MB = 1_024 * KB,
}