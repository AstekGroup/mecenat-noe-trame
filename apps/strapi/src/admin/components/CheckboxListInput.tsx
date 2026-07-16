import React, { forwardRef, useCallback, useMemo } from 'react';
import { useTheme } from 'styled-components';

interface IntlMessage {
  id: string;
  defaultMessage: string;
}

interface CheckboxListAttribute {
  type: string;
  options?: Record<string, unknown>;
}

export interface CheckboxListInputProps {
  name: string;
  value: string[] | null | undefined;
  onChange: (event: {
    target: { name: string; value: string[] | null; type: 'json' };
  }) => void;
  attribute: CheckboxListAttribute;
  label?: React.ReactNode;
  intlLabel?: IntlMessage;
  description?: React.ReactNode;
  error?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

interface CheckboxListTheme {
  colors?: {
    danger600?: string;
    neutral600?: string;
    neutral800?: string;
    primary600?: string;
  };
  fontSizes?: string[];
  fontWeights?: {
    bold?: number;
    regular?: number;
  };
  lineHeights?: number[];
  spaces?: string[];
}

const CheckboxListInput = forwardRef<HTMLFieldSetElement, CheckboxListInputProps>(
  (
    {
      name,
      value,
      onChange,
      attribute,
      label,
      intlLabel,
      description,
      error,
      hint,
      disabled = false,
      required = false,
    },
    ref,
  ) => {
    const theme = useTheme() as CheckboxListTheme;
    const choices = useMemo(() => {
      return Array.isArray(attribute.options?.choices)
        ? (attribute.options.choices as string[])
        : [];
    }, [attribute.options]);

    const selected = value ?? [];
    const hasError = Boolean(error);

    const descriptionId = description ? `${name}-description` : undefined;
    const hintId = hint ? `${name}-hint` : undefined;
    const errorId = error ? `${name}-error` : undefined;
    const ariaDescribedBy = [descriptionId, hintId, errorId]
      .filter(Boolean)
      .join(' ') || undefined;

    const handleToggle = useCallback(
      (choice: string, isChecked: boolean) => {
        if (disabled) {
          return;
        }

        const next = isChecked
          ? Array.from(new Set([...selected, choice]))
          : selected.filter((item) => item !== choice);

        onChange({ target: { name, value: next, type: 'json' } });
      },
      [disabled, name, onChange, selected],
    );

    const legendText = label ?? intlLabel?.defaultMessage ?? name;
    const colors = {
      danger: theme.colors?.danger600 ?? '#d02b2b',
      muted: theme.colors?.neutral600 ?? 'currentColor',
      text: theme.colors?.neutral800 ?? 'currentColor',
      primary: theme.colors?.primary600 ?? 'currentColor',
    };
    const typography = {
      choiceSize: theme.fontSizes?.[2] ?? '14px',
      labelSize: theme.fontSizes?.[1] ?? '12px',
      choiceLineHeight: theme.lineHeights?.[4] ?? 1.43,
      labelLineHeight: theme.lineHeights?.[3] ?? 1.33,
      bold: theme.fontWeights?.bold ?? 600,
      regular: theme.fontWeights?.regular ?? 400,
    };
    const spacing = {
      compact: theme.spaces?.[1] ?? '4px',
      regular: theme.spaces?.[2] ?? '8px',
    };

    return (
      <fieldset
        ref={ref}
        disabled={disabled}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        style={{
          border: 'none',
          margin: 0,
          padding: 0,
          minWidth: 0,
          color: colors.text,
        }}
      >
        <legend
          style={{
            padding: 0,
            marginBottom: spacing.regular,
            fontWeight: typography.bold,
            fontSize: typography.labelSize,
            lineHeight: typography.labelLineHeight,
            color: colors.text,
          }}
        >
          {legendText}
          {required && (
            <span aria-hidden="true" style={{ color: colors.danger }}>
              {' *'}
            </span>
          )}
        </legend>

        {description && (
          <p
            id={descriptionId}
            style={{
              margin: `0 0 ${spacing.regular}`,
              fontSize: typography.labelSize,
              lineHeight: typography.labelLineHeight,
              color: colors.muted,
            }}
          >
            {description}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.compact,
          }}
        >
          {choices.map((choice, index) => {
            const inputId = `${name}-${index}`;
            const isSelected = selected.includes(choice);
            return (
              <label
                key={choice}
                htmlFor={inputId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  minHeight: '24px',
                  fontSize: typography.choiceSize,
                  fontWeight: typography.regular,
                  lineHeight: typography.choiceLineHeight,
                  color: colors.text,
                }}
              >
                <input
                  id={inputId}
                  name={inputId}
                  type="checkbox"
                  checked={isSelected}
                  onChange={(event) =>
                    handleToggle(choice, event.target.checked)
                  }
                  disabled={disabled}
                  style={{
                    width: '16px',
                    height: '16px',
                    margin: 0,
                    flex: '0 0 auto',
                    accentColor: colors.primary,
                  }}
                />
                <span>{choice}</span>
              </label>
            );
          })}
        </div>

        {hint && !error && (
          <p
            id={hintId}
            style={{
              margin: `${spacing.regular} 0 0`,
              fontSize: typography.labelSize,
              lineHeight: typography.labelLineHeight,
              color: colors.muted,
            }}
          >
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            style={{
              margin: `${spacing.regular} 0 0`,
              fontSize: typography.labelSize,
              lineHeight: typography.labelLineHeight,
              color: colors.danger,
            }}
          >
            {error}
          </p>
        )}
      </fieldset>
    );
  },
);

CheckboxListInput.displayName = 'CheckboxListInput';

export default CheckboxListInput;
