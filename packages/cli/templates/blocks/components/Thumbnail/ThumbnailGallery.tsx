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
// fails silently in hosted previews. The scenes have varied luminance.
const VALLEY_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACFUlEQVR42u1ay07CQBQdKhsTFxDlEQGNqEt/wQ9w6w8YYGNcWiJN3PBMXLgWvk0BSymlgC3IguW4qAgppZ1Cm2nxTmZDMnPuOTP33M5MCNw83yE/tyDGGARQFYD8zX8XdgD53gPI7x6AHdi6vT0+Lf+8f30hn8tg2k3HXtNDPp1BCFPsdbZguK51tkCIwGCMaPU6y5nkRp3lSEAYWvQbec4yvxt5zhLH62XUkp7ny6gVvSD29pfYkp7vU4iaiXO1siX7XK1siUOzjGarZhqy1bKny6jWs5WSMftKiRCBwXQVIJypFHXsM5Ui+fTA9cMt3MjgQvO/LzQInlXAxLADYGJIITAxeACOEjt5mJPfO7HLE7+aePAhaBqiFynzSz3yYNfYL5SsH+lFEw+bXf1uNIXIedJ5Ew9bYiSdcJJ6S7T7QrShiUdtcTnk0ZkDMv4w12kzjLLJs8pqpFFb3PJ1wpy9SRR7O/DF99aif/YQQoenxxusvQnsahRdiL34VZpkpsJLs8nUcthsMt0PHdhir/CSrfG6EEQpZCuGwksKLxFmjl32C82EKaQK/c0cqXT6CKFwKu4GuIavga8to2pX3r6wqEI/nIy5BK4xN36ddibAnKvald0A12D1/5UYiwM3Pq5jUQ4loo7jj0V5cZib9IauHhBcWppfE39L7rJ38T7gX+rz74DPGwgAASAABIAAEAACaLYfoelE8OqtXTkAAAAASUVORK5CYII=';
const MOUNTAIN_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACBElEQVR42u2ZS08CMRDHO91dPJioARONiYGbxoNRPwGIIAcfn1XjgSwifiiBfbYewAR0t0+kFttwIdvO/H+dGbodYLvaQDYPjCwfPgKwGwAQuAgYBkAuhVwKaUXANMDo/XXxa6t5I7Ucdg5OzEkflD1qNTvCBxkgIx+G+jmbmB3YPTxd/96/jUKRadetruVFLKAN9o7O1qxqOOyLT263e7wI/PVzACw/iXnyzJ8DvCqADU8hqB6fr1/UIHwRmdbp3m3+z6iZK2Xn9n4lcxBCUKtfmNrfsP9c9qjbexANUq1+aTZNwv7TsvRHuSzbb1y5C43JYX9fCMDdiV1XAnk+yjNrI4C9OQPJ1QDMvix4SyQ0tymFKOCfPECJ3UVMAQOiFkSAsc8UgfgJpVgDhCKsAU6oEKGIC5UUIoTOGZQgCKES28RzIZ1COSGLUjyMlZcL0rJdyEUgz/NCQZ7nqS0XZGbYl3gXyrKMocz3feXlIuRl9rGgdK579gQd9WwL/BTK0lTchx8Ev/fLW2ifk0Jpksj5SNOgUtE0ImWf1dhKk1jBx0xuUNnSMSJuH0PJ0HScJrG+Ea59ACgu4iSO9H2sxAjXfkERJ9HUlutYEkffizieTmy7E38VcTwdW9lWmZWCperR7G/WaPJhb1cCR2OL1aMN6Mw5AAfgAByAA3AADsAB/GeAT93bt1ixxJ3mAAAAAElFTkSuQmCC';
const PUPPY_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACDElEQVR42u2Yy07CQBSGjxUfAiEsvOsrmBiNFwSDAqIrfQKfygAF8QJeqOAlGI1GHwBaLKIu1LUblx0XJEi4lLac0gzOZDY0Tb//7+GfOdO+H2EHaB42RSF0GyCEdgP0VwBYBVgGWAZYBVgG/vVODOwv1KMhti/5a39+XaSoqcCgO9DKz2c2icviiAK4s6n6Wm+4OI6gDocn0PadOTwBRCJHFII1nd6gxro7vUEsqGWrEBYXLQMuX0gX2OULoXCt3AdQ0Fa2Eiho+itAFMu6ABQ02j4gJ+K6wHIijsLthWUUbSMrxniN1GKMx4JyhADilPj2HiSeRyRiVqAyxUhURb0YieLiTMlAIRwBgKntrcaLNB1o8rths1cC/iRvo/RMHz/NU/xdaC9dwGwlEoK46Z3sjvSEIGJmYD8jVZ+7sTxhtvoqDue70EFWanx6yG2KjTpWpxU4vCyqkNYXx3HVq+CMZODo6lkLL7gw1rn0tix9BpLXsi52YH60E/UacVrPA6mcbEyBf063DV2s9hU4vil18iJTOXltdkT7/XpxaiE+uX1BSWFF0+rMsPptxnBcqz4PS32tPpW20jCuSQbS92WTdqKzuzIArEwPIeLqz8Tmqa9VjIj7y8D541vXujHh4RXvPEAIAGSe3oHO0W/nBkof30Dt4IDywQwwA8wAM8AMMAPMADPADDAD1o1fMFhlmPil7jgAAAAASUVORK5CYII=';
const BRIDGE_SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAB90lEQVR42u1YTU/CQBDdNiWxrVf7AXrAgnx4Rv7/Ub2LH/GgQgFjxAMIDSbrQWIKdOl0u6VdnckeaDr75j2mb7O7yvt0SWQOjVIqtQCVSB4alV0AodgB9ACuQugByVYhS7sMP75+dXMUoIw+Ani2vU49HOOcZKhC2Me+zbADwwmoA04JxG+07Ba3A8UMxZ8sYpPc0hUccbi8kHwvtN+FWZOc/5/YC4nuAC1eBwYB1JfwzIJ6YP87K5UQChn9oBOL1Q86QDSBQ3l+m8Plnhxcs169LDq5mDiZgEgZeVFfCXhKLgBvJfBEhrcS2AH0QKgDlBRqVI/0RPlqofhXLZ0QUrV0+JQCeeDU0iN/7/s8wBeerW/reRzPIasQf889Wxf3+bBUxUzk94BnG4QQzzbSc/+BYh0w4jzAVbMWKlmzjTT0a2z2EHDlfjhL9LHWneh6D6NPjk+fhQYHV0XVqzsGkE1S9rszVUoJcEDq1R1DIBoEGdqBM9cQmAlHi52l3PrT3dMarslR7I5tLT5AFrKaBfv0LOHIuzyQkkTDNYVjbiMzO9AsC6jULJthHCGYmx64GWx6oJVBmZ4/Ew7b82cR54Es2Gf0p7TKJqHrJ7J2JSvnZRStiqn97gTblUNJbyXI+bGU1FcmxmsVFIACUAAKQAEoAAX8YwHfLyw0mt5gMHQAAAAASUVORK5CYII=';

const ATTACHMENTS = [
  {
    id: 1,
    src: VALLEY_SCENE,
    alt: 'River through a valley',
    label: 'valley.jpg',
  },
  {
    id: 2,
    src: MOUNTAIN_SCENE,
    alt: 'Foggy mountain peak',
    label: 'mountain.jpg',
  },
  {id: 3, src: PUPPY_SCENE, alt: 'Golden retriever puppy', label: 'puppy.jpg'},
  {id: 4, src: BRIDGE_SCENE, alt: 'Bridge at sunset', label: 'bridge.jpg'},
];

export default function ThumbnailGallery() {
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState(ATTACHMENTS);

  return (
    <Stack direction="vertical" gap={3}>
      <Text type="supporting" color="secondary">
        Click to preview, dismiss to remove
      </Text>
      <Stack direction="horizontal" gap={2} vAlign="center">
        {items.map(item => (
          <Thumbnail
            key={item.id}
            src={item.src}
            alt={item.alt}
            label={item.label}
            onClick={() => setSelected(item.label)}
            onRemove={() =>
              setItems(prev => prev.filter(i => i.id !== item.id))
            }
          />
        ))}
      </Stack>
      {selected != null && (
        <Text type="supporting" color="active">
          Previewing: {selected}
        </Text>
      )}
    </Stack>
  );
}
