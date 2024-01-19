export function buildConfiguration() {
  return {
    soc: {
      endpoint: process.env.SOC_INTEGRATION_ENDPOINT,
      username: process.env.SOC_INTEGRATION_USERNAME,
      password: process.env.SOC_INTEGRATION_PASSWORD,
      accessKey: process.env.SOC_INTEGRATION_ACCESS_KEY,
      companyCode: process.env.SOC_INTEGRATION_COMPANY_CODE,
      responsibleCode: process.env.SOC_INTEGRATION_RESPONSIBLE_CODE,
      userCode: process.env.SOC_INTEGRATION_USER_CODE,
    },
    database: {
      hostname: process.env.SOC_INTEGRATION_DB_HOSTNAME,
      username: process.env.SOC_INTEGRATION_DB_USERNAME,
      password: process.env.SOC_INTEGRATION_DB_PASSWORD,
      database: process.env.SOC_INTEGRATION_DB_DATABASE,
      port: Number(process.env.SOC_INTEGRATION_DB_PORT) || 1433,
    },
  };
}

export type Configuration = ReturnType<typeof buildConfiguration>;
