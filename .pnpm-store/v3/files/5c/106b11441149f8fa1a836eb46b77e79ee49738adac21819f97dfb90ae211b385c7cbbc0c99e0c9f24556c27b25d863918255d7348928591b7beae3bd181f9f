import {type expect} from 'vitest'
import {type TestingLibraryMatchers} from './matchers'

declare module 'vitest' {
  interface Assertion<T = any>
    extends TestingLibraryMatchers<
      ReturnType<typeof expect.stringContaining>,
      T
    > {}
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<
      ReturnType<typeof expect.stringContaining>,
      any
    > {}
}
