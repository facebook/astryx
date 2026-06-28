// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Demo imagery is inlined as data URIs so the example is self-contained and
// same-origin. Thumbnail's remove-button overlay uses useImageMode, which
// fetches the image to sample pixels (APCA) for contrast — a cross-origin CDN
// URL without CORS headers cannot be fetched/sampled, so contrast detection
// fails silently in hosted previews. The scenes have deliberately distinct
// luminance (dark / light / warm) to show the overlay adapting.
const DARK_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACBElEQVR42u2ZS08CMRDHO91dPJioARONiYGbxoNRPwGIIAcfn1XjgSwifiiBfbYewAR0t0+kFttwIdvO/H+dGbodYLvaQDYPjCwfPgKwGwAQuAgYBkAuhVwKaUXANMDo/XXxa6t5I7Ucdg5OzEkflD1qNTvCBxkgIx+G+jmbmB3YPTxd/96/jUKRadetruVFLKAN9o7O1qxqOOyLT263e7wI/PVzACw/iXnyzJ8DvCqADU8hqB6fr1/UIHwRmdbp3m3+z6iZK2Xn9n4lcxBCUKtfmNrfsP9c9qjbexANUq1+aTZNwv7TsvRHuSzbb1y5C43JYX9fCMDdiV1XAnk+yjNrI4C9OQPJ1QDMvix4SyQ0tymFKOCfPECJ3UVMAQOiFkSAsc8UgfgJpVgDhCKsAU6oEKGIC5UUIoTOGZQgCKES28RzIZ1COSGLUjyMlZcL0rJdyEUgz/NCQZ7nqS0XZGbYl3gXyrKMocz3feXlIuRl9rGgdK579gQd9WwL/BTK0lTchx8Ev/fLW2ifk0Jpksj5SNOgUtE0ImWf1dhKk1jBx0xuUNnSMSJuH0PJ0HScJrG+Ea59ACgu4iSO9H2sxAjXfkERJ9HUlutYEkffizieTmy7E38VcTwdW9lWmZWCperR7G/WaPJhb1cCR2OL1aMN6Mw5AAfgAByAA3AADsAB/GeAT93bt1ixxJ3mAAAAAElFTkSuQmCC';
const LIGHT_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAB90lEQVR42u1YTU/CQBDdNiWxrVf7AXrAgnx4Rv7/Ub2LH/GgQgFjxAMIDSbrQWIKdOl0u6VdnckeaDr75j2mb7O7yvt0SWQOjVIqtQCVSB4alV0AodgB9ACuQugByVYhS7sMP75+dXMUoIw+Ani2vU49HOOcZKhC2Me+zbADwwmoA04JxG+07Ba3A8UMxZ8sYpPc0hUccbi8kHwvtN+FWZOc/5/YC4nuAC1eBwYB1JfwzIJ6YP87K5UQChn9oBOL1Q86QDSBQ3l+m8Plnhxcs169LDq5mDiZgEgZeVFfCXhKLgBvJfBEhrcS2AH0QKgDlBRqVI/0RPlqofhXLZ0QUrV0+JQCeeDU0iN/7/s8wBeerW/reRzPIasQf889Wxf3+bBUxUzk94BnG4QQzzbSc/+BYh0w4jzAVbMWKlmzjTT0a2z2EHDlfjhL9LHWneh6D6NPjk+fhQYHV0XVqzsGkE1S9rszVUoJcEDq1R1DIBoEGdqBM9cQmAlHi52l3PrT3dMarslR7I5tLT5AFrKaBfv0LOHIuzyQkkTDNYVjbiMzO9AsC6jULJthHCGYmx64GWx6oJVBmZ4/Ew7b82cR54Es2Gf0p7TKJqHrJ7J2JSvnZRStiqn97gTblUNJbyXI+bGU1FcmxmsVFIACUAAKQAEoAAX8YwHfLyw0mt5gMHQAAAAASUVORK5CYII=';
const WARM_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACDElEQVR42u2Yy07CQBSGjxUfAiEsvOsrmBiNFwSDAqIrfQKfygAF8QJeqOAlGI1GHwBaLKIu1LUblx0XJEi4lLac0gzOZDY0Tb//7+GfOdO+H2EHaB42RSF0GyCEdgP0VwBYBVgGWAZYBVgG/vVODOwv1KMhti/5a39+XaSoqcCgO9DKz2c2icviiAK4s6n6Wm+4OI6gDocn0PadOTwBRCJHFII1nd6gxro7vUEsqGWrEBYXLQMuX0gX2OULoXCt3AdQ0Fa2Eiho+itAFMu6ABQ02j4gJ+K6wHIijsLthWUUbSMrxniN1GKMx4JyhADilPj2HiSeRyRiVqAyxUhURb0YieLiTMlAIRwBgKntrcaLNB1o8rths1cC/iRvo/RMHz/NU/xdaC9dwGwlEoK46Z3sjvSEIGJmYD8jVZ+7sTxhtvoqDue70EFWanx6yG2KjTpWpxU4vCyqkNYXx3HVq+CMZODo6lkLL7gw1rn0tix9BpLXsi52YH60E/UacVrPA6mcbEyBf063DV2s9hU4vil18iJTOXltdkT7/XpxaiE+uX1BSWFF0+rMsPptxnBcqz4PS32tPpW20jCuSQbS92WTdqKzuzIArEwPIeLqz8Tmqa9VjIj7y8D541vXujHh4RXvPEAIAGSe3oHO0W/nBkof30Dt4IDywQwwA8wAM8AMMAPMADPADDAD1o1fMFhlmPil7jgAAAAASUVORK5CYII=';

const IMAGES = [
  {
    id: 1,
    src: DARK_SCENE,
    alt: 'Dark cityscape at night',
    label: 'dark-city.jpg',
  },
  {id: 2, src: LIGHT_SCENE, alt: 'Bright snowy landscape', label: 'snow.jpg'},
  {
    id: 3,
    src: WARM_SCENE,
    alt: 'Warm sunset over mountains',
    label: 'sunset.jpg',
  },
];

export default function ThumbnailRemovable() {
  const [items, setItems] = useState(IMAGES);

  return (
    <Stack direction="vertical" gap={4}>
      <Text type="supporting" color="secondary">
        Remove button adapts contrast to image luminance
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="center">
        {items.map(item => (
          <Thumbnail
            key={item.id}
            src={item.src}
            alt={item.alt}
            label={item.label}
            onRemove={() =>
              setItems(prev => prev.filter(i => i.id !== item.id))
            }
          />
        ))}
        {items.length === 0 && (
          <Text type="supporting" color="secondary">
            All removed.
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
