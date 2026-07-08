// flow-typed signature: 28ddcca31abd597a77830710de25f5fe
// flow-typed version: a75473352d/mkdirp_v1.x.x/flow_>=v0.83.x

declare module 'mkdirp' {
  import typeof { mkdir, stat } from 'fs';

  declare type FsImplementation = {
    +mkdir?: mkdir,
    +stat?: stat,
    ...
  };

  declare type Options = number | string | {| mode?: number; fs?: FsImplementation |};

  declare type Callback = (err: ?Error, path: ?string) => void;

  declare module.exports: {|
    (path: string, options?: Options | Callback): Promise<string| void>;
    sync(path: string, options?: Options): string | void;
    manual(path: string, options?: Options | Callback): Promise<string| void>;
    manualSync(path: string, options?: Options): string | void;
    native(path: string, options?: Options | Callback): Promise<string| void>;
    nativeSync(path: string, options?: Options): string | void;
  |};
}
