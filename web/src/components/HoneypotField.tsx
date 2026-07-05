import React, { forwardRef } from 'react';

type HoneypotFieldProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Invisible field real users never see or fill. Bots that auto-fill every
 * input on a form will populate it, so a non-empty value on submit means
 * the request came from a bot and should be rejected. Must forward its ref
 * so react-hook-form's register() can read the input's value on submit.
 */
export const HoneypotField = forwardRef<HTMLInputElement, HoneypotFieldProps>(function HoneypotField(
  props,
  ref,
) {
  return (
    <div
      style={{ position: 'absolute', left: '-9999px', top: 0, width: 1, height: 1, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <input ref={ref} type="text" tabIndex={-1} autoComplete="off" {...props} />
    </div>
  );
});
