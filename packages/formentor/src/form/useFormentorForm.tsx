// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useFormentorForm.tsx
 * @input ../schema, ../inputset, ./validation, ./renderable
 * @output useFormentorForm — the hook that crosses a schema with an InputSet into a renderable form
 * @position Public form entry point
 */

import * as React from 'react';
import {
  getBaseSchema,
  rootPath,
  type ObjectSchemaImpl,
  type InferValue,
  type InferPartial,
  type Schema,
} from '../schema';
import type {InputSet, CommonFieldProps, FieldMode} from '../inputset/types';
import {
  validateSchemaConstraint,
  isEmpty,
  helpers,
  type FormentorError,
  type ValidatorHelpers,
  type ValidationResult,
  type Validator,
  type AsyncValidator,
} from './validation';
import {Renderable, type RenderOverlay} from './renderable';

/** Configuration for a form. Generic over the object's property map `P`, which
 * infers cleanly from `schema.properties` and drives every value type. */
export interface FormentorFormConfig<P extends Record<string, Schema>> {
  schema: ObjectSchemaImpl<P>;
  inputSet: InputSet;
  initialValue?: InferPartial<ObjectSchemaImpl<P>>;
  /** Global display mode; individual fields may override via render overlay. */
  mode?: FieldMode;
  /** Form-level (cross-field) validation. Runs on submit. */
  validate?: Validator<InferPartial<ObjectSchemaImpl<P>>>;
  /** Submit-time handler. Receives the fully validated value plus pass/fail and
   * an AbortSignal. Return (or resolve) `fail(...)` to surface a server error;
   * a plain `void`/sync return is treated as success. */
  onSubmit?: (
    value: InferValue<ObjectSchemaImpl<P>>,
    helpers: ValidatorHelpers & {signal: AbortSignal},
  ) => void | ValidationResult | Promise<ValidationResult>;
}

export interface FormState<P extends Record<string, Schema>> {
  values: InferPartial<ObjectSchemaImpl<P>>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormentorForm<P extends Record<string, Schema>> {
  fields: Record<string, Renderable>;
  submitButton: {render: (overlay?: RenderOverlay) => React.ReactNode};
  render: (opts?: {children?: React.ReactNode}) => React.ReactNode;
  state: FormState<P>;
  submit: () => void;
}

interface FieldValidators {
  validate?: Validator<unknown>;
  validateAsync?: AsyncValidator<unknown>;
}

/** Minimal shape a resolved async submit result is duck-typed against. */
interface ValidationResultShape {
  ok: boolean;
  errors?: FormentorError[];
}

/** Constraints carried by base schemas (title/description read for labels). */
interface ConstraintsCarrier {
  constraints?: {title?: string; description?: string};
}

export function useFormentorForm<P extends Record<string, Schema>>(
  config: FormentorFormConfig<P>,
): FormentorForm<P> {
  const {schema, inputSet, mode} = config;

  const [values, setValues] = React.useState<Record<string, unknown>>(() => ({
    ...(config.initialValue as Record<string, unknown> | undefined),
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Field-level validators registered by render() overlays, keyed by field name.
  const fieldValidators = React.useRef<Record<string, FieldValidators>>({});
  const abortRef = React.useRef<AbortController | null>(null);

  const properties = schema.properties as Record<string, Schema>;

  const runFieldValidation = React.useCallback(
    (name: string, value: unknown): string | null => {
      const fieldSchema = properties[name];
      const required =
        !fieldSchema.meta.omissible && !fieldSchema.meta.nullable;
      if (required && isEmpty(value)) {
        return 'This field is required';
      }
      const schemaError = validateSchemaConstraint(fieldSchema, value);
      if (schemaError) {
        return schemaError;
      }
      const fv = fieldValidators.current[name];
      if (fv?.validate) {
        const result = fv.validate(value, helpers);
        if (!result.ok) {
          return result.errors[0]?.message ?? 'Invalid';
        }
      }
      return null;
    },
    [properties],
  );

  const handleChange = React.useCallback(
    (name: string, value: unknown) => {
      setValues(prev => ({...prev, [name]: value}));
      setTouched(prev => ({...prev, [name]: true}));
      // Revalidate this field on change once it's been touched or submitted.
      setErrors(prev => {
        const msg = runFieldValidation(name, value);
        const next = {...prev};
        if (msg) {
          next[name] = msg;
        } else {
          delete next[name];
        }
        return next;
      });
    },
    [runFieldValidation],
  );

  /** Full validation sweep across every field + form-level validator. */
  const validateAll = React.useCallback((): {
    ok: boolean;
    errors: Record<string, string>;
  } => {
    const next: Record<string, string> = {};
    for (const name of Object.keys(properties)) {
      const msg = runFieldValidation(name, values[name]);
      if (msg) {
        next[name] = msg;
      }
    }
    if (config.validate) {
      const result = config.validate(values as InferPartial<ObjectSchemaImpl<P>>, helpers);
      if (!result.ok) {
        for (const err of result.errors) {
          const key = err.valuePath?.segments[0] ?? '__form__';
          next[key] = err.message;
        }
      }
    }
    return {ok: Object.keys(next).length === 0, errors: next};
  }, [properties, values, config, runFieldValidation]);

  const submit = React.useCallback(() => {
    setIsSubmitted(true);
    const {ok, errors: allErrors} = validateAll();
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(properties).map(k => [k, true])));
    if (!ok) {
      return;
    }

    const onSubmit = config.onSubmit;
    if (!onSubmit) {
      return;
    }

    // Fresh AbortSignal per submission.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const validatedValue = values as InferValue<ObjectSchemaImpl<P>>;
    // Distinguish async submit (returns a promise) from sync.
    type SubmitFn = (
      value: InferValue<ObjectSchemaImpl<P>>,
      helpers: ValidatorHelpers & {signal: AbortSignal},
    ) => unknown;
    const maybePromise = (onSubmit as SubmitFn)(validatedValue, {
      ...helpers,
      signal: controller.signal,
    });
    if (
      maybePromise instanceof Promise ||
      (maybePromise != null &&
        typeof (maybePromise as {then?: unknown}).then === 'function')
    ) {
      setIsSubmitting(true);
      Promise.resolve(maybePromise)
        .then((result: unknown) => {
          if (
            result != null &&
            typeof result === 'object' &&
            (result as ValidationResultShape).ok === false
          ) {
            const next: Record<string, string> = {};
            for (const err of (result as ValidationResultShape).errors ?? []) {
              const key = err.valuePath?.segments[0] ?? '__form__';
              next[key] = err.message;
            }
            setErrors(next);
          }
        })
        .finally(() => setIsSubmitting(false));
    }
  }, [validateAll, config, values, properties]);

  // Build one renderable per property.
  const fields = React.useMemo(() => {
    const result: Record<string, Renderable> = {};
    for (const name of Object.keys(properties)) {
      const fieldSchema = properties[name];
      const base = getBaseSchema(fieldSchema);
      const {Component} = inputSet.resolve(base.meta.type, fieldSchema);
      const constraints =
        (base as unknown as ConstraintsCarrier).constraints ?? {};
      const label: string = constraints.title ?? toTitleCase(name);

      const boundProps: CommonFieldProps & Record<string, unknown> = {
        label,
        description: constraints.description,
        isOptional: fieldSchema.meta.omissible || fieldSchema.meta.nullable,
        mode,
        errorMessage: touched[name] || isSubmitted ? errors[name] : undefined,
        value: values[name],
        onChange: (v: unknown) => handleChange(name, v),
        valuePath: rootPath().property(name),
        schema: fieldSchema,
      };

      // A Renderable whose render() also registers field-level validators.
      const registering = new RegisteringRenderable(
        boundProps,
        Component,
        validators => {
          fieldValidators.current[name] = validators;
        },
      );
      result[name] = registering;
    }
    return result;
  }, [
    properties,
    inputSet,
    values,
    errors,
    touched,
    isSubmitted,
    mode,
    handleChange,
  ]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = Object.keys(touched).length > 0;

  const state: FormState<P> = {
    values: values as InferPartial<ObjectSchemaImpl<P>>,
    errors,
    isSubmitting,
    isSubmitted,
    isValid,
    isDirty,
  };

  const submitButton = {
    render: (overlay?: RenderOverlay) => {
      const {SubmitButton} = inputSet;
      const children = (overlay?.children as React.ReactNode) ?? undefined;
      return (
        <SubmitButton isSubmitting={isSubmitting} onClick={submit}>
          {children}
        </SubmitButton>
      );
    },
  };

  const render = (opts?: {children?: React.ReactNode}) => {
    const onFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      submit();
    };
    const body = opts?.children ?? (
      <>
        {Object.values(fields).map((f, i) => (
          <React.Fragment key={i}>{f.render()}</React.Fragment>
        ))}
        {submitButton.render()}
      </>
    );
    const formErrors: FormentorError[] = errors.__form__
      ? [{message: errors.__form__}]
      : [];
    if (inputSet.FormWrapper) {
      const {FormWrapper} = inputSet;
      return (
        <FormWrapper errors={formErrors} onSubmit={onFormSubmit}>
          {body}
        </FormWrapper>
      );
    }
    return <form onSubmit={onFormSubmit}>{body}</form>;
  };

  return {fields, submitButton, render, state, submit};
}

/** Renderable variant that registers validators from its overlay on render. */
class RegisteringRenderable extends Renderable {
  constructor(
    props: CommonFieldProps & Record<string, unknown>,
    DefaultInput: React.ComponentType<
      CommonFieldProps & Record<string, unknown>
    >,
    private readonly register: (validators: FieldValidators) => void,
  ) {
    super(props, DefaultInput);
  }

  render(
    overlayOrCallback?: Parameters<Renderable['render']>[0],
  ): React.ReactNode {
    if (overlayOrCallback && typeof overlayOrCallback === 'object') {
      const {validate, validateAsync} = overlayOrCallback as RenderOverlay;
      if (validate || validateAsync) {
        this.register({
          validate: validate as Validator<unknown> | undefined,
          validateAsync: validateAsync as AsyncValidator<unknown> | undefined,
        });
      }
    }
    return super.render(overlayOrCallback);
  }
}

function toTitleCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}
