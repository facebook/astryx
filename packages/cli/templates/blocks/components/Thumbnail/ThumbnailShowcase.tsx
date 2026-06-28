// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';

// Inline data URI so the example is self-contained and same-origin — see
// ThumbnailRemovable for why image-backed Thumbnails avoid cross-origin URLs.
const SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACBElEQVR42u2ZS08CMRDHO91dPJioARONiYGbxoNRPwGIIAcfn1XjgSwifiiBfbYewAR0t0+kFttwIdvO/H+dGbodYLvaQDYPjCwfPgKwGwAQuAgYBkAuhVwKaUXANMDo/XXxa6t5I7Ucdg5OzEkflD1qNTvCBxkgIx+G+jmbmB3YPTxd/96/jUKRadetruVFLKAN9o7O1qxqOOyLT263e7wI/PVzACw/iXnyzJ8DvCqADU8hqB6fr1/UIHwRmdbp3m3+z6iZK2Xn9n4lcxBCUKtfmNrfsP9c9qjbexANUq1+aTZNwv7TsvRHuSzbb1y5C43JYX9fCMDdiV1XAnk+yjNrI4C9OQPJ1QDMvix4SyQ0tymFKOCfPECJ3UVMAQOiFkSAsc8UgfgJpVgDhCKsAU6oEKGIC5UUIoTOGZQgCKES28RzIZ1COSGLUjyMlZcL0rJdyEUgz/NCQZ7nqS0XZGbYl3gXyrKMocz3feXlIuRl9rGgdK579gQd9WwL/BTK0lTchx8Ev/fLW2ifk0Jpksj5SNOgUtE0ImWf1dhKk1jBx0xuUNnSMSJuH0PJ0HScJrG+Ea59ACgu4iSO9H2sxAjXfkERJ9HUlutYEkffizieTmy7E38VcTwdW9lWmZWCperR7G/WaPJhb1cCR2OL1aMN6Mw5AAfgAByAA3AADsAB/GeAT93bt1ixxJ3mAAAAAElFTkSuQmCC';

export default function ThumbnailShowcase() {
  return <Thumbnail src={SCENE} alt="Sample image" label="photo.jpg" />;
}
