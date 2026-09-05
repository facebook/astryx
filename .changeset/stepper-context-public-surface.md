---
'@astryxdesign/core': patch
---

[component] Deprecate `useStepperContext` and narrow `StepperContextValue` to
the supported subset. Stepper's private coordination — the connector-fill
choreography (`previousActiveStep`) and the dev-mode step registry
(`registerStep`) — is no longer named on the public interface, so changing it
can no longer break consumer types. Both names stay exported until the next
major.

Custom step composition is not, and was not, supported through this hook: a
Stepper builds its context entirely from the props you passed it, so the hook
returns nothing the call site already lacks, and a hand-rolled step still
cannot draw a correct connector track. Compose with `<Step>` and its
`children`, `indicator`, and `endContent` slots, and gate step content on the
same state that drives `activeStep`.

@alif416
