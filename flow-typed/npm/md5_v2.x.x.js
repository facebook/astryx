// flow-typed signature: 198b480a6b35dbf3a74cb37d21258b00
// flow-typed version: c6154227d1/md5_v2.x.x/flow_>=v0.104.x

// @flow

declare module "md5" {
  declare module.exports: (
    message: string | Buffer,
    options?: {
      asString?: boolean,
      asBytes?: boolean,
      encoding?: string,
      ...
    }
  ) => string;
}
