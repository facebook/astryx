// flow-typed signature: 31191d41b239d1242753bdea18136ae9
// flow-typed version: 6ee04b16cf/rimraf_v3.x.x/flow_>=v0.104.x

declare module 'rimraf' {
  declare type Options = {
    maxBusyTries?: number,
    emfileWait?: number,
    glob?: boolean,
    disableGlob?: boolean,
    ...
  };
  
  declare type Callback = (err: ?Error, path: ?string) => void;

  declare module.exports: {
    (f: string, opts?: Options | Callback, callback?: Callback): void,
    sync(path: string, opts?: Options): void,
    ...
  };
}
