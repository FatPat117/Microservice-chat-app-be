import { ZodObject, ZodRawShape, z } from "zod";
interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  serviceName?:string;
}

type SchemaOutput<T extends ZodRawShape> = ZodObject<T>["_output"];

export const createEnv = <T extends ZodRawShape>(schema:T,options?:EnvOptions):SchemaOutput<T> => {
  const {source=process.env,serviceName='service'} = options || {};

  const parsed = z.object(schema).safeParse(source);

  if(!parsed.success){
    const formatedErrors = parsed.error.format();
    throw new Error(
      `[${serviceName}] Environment variables validation failed: ${JSON.stringify(formatedErrors,null,2)}`
    )
  }
  return parsed.data;
}
export type EnvSchema<T extends ZodRawShape> = ZodObject<T>;
