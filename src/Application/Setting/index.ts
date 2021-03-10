import { ContainerBuilderInterface } from "../Interface/ContainerBuilderInterface";
import Joi, { ValidationResult } from "joi";
import dotEnv, { DotenvConfigOutput } from "dotenv";
import { CONTAINER_ENTRY_IDENTIFIER } from "../Dependencies";
import { ContainerInterface } from "../Interface/ContainerInterface";

export interface ISettings {
  SERVER_PORT: number;
  DSN: string;
  KAFKA_LOGLEVEL: number;
  KAFKA_ADVERTISED_HOST_NAME: string;
  KAFKA_PORT: number;
}

const SettingsManager = (containerBuilder: ContainerBuilderInterface) => {
  const config: DotenvConfigOutput = dotEnv.config();
  if (config.error !== undefined) {
    console.error(config.error);
    process.exit(1);
  }

  const schemaSettings = Joi.object({
    SERVER_PORT: Joi.number().required(),
    DSN: Joi.string().required(),
    KAFKA_ADVERTISED_HOST_NAME: Joi.string().required(),
    KAFKA_LOGLEVEL: Joi.number().required(),
    KAFKA_PORT: Joi.number().required(),
  });

  const validationResult: ValidationResult = schemaSettings.validate({
    SERVER_PORT: process.env.SERVER_PORT,
    DSN: process.env.DSN,
    KAFKA_ADVERTISED_HOST_NAME: process.env.KAFKA_ADVERTISED_HOST_NAME,
    KAFKA_LOGLEVEL: process.env.KAFKA_LOGLEVEL,
    KAFKA_PORT: process.env.KAFKA_PORT,
  });

  if (validationResult.error !== undefined) {
    console.error(validationResult.error);
    process.exit(1);
  }

  if (validationResult.warning !== undefined) {
    console.error(validationResult.warning);
    process.exit(1);
  }

  containerBuilder.addDefinitions([
    {
      key: CONTAINER_ENTRY_IDENTIFIER.Settings,
      value: (_container: ContainerInterface) => {
        return validationResult.value as ISettings;
      },
    },
  ]);
};

export { SettingsManager };
