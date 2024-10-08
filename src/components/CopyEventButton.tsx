'use client';

import { Copy, CopyCheck, CopyX } from 'lucide-react';
import { useState } from 'react';

import { Button, ButtonProps } from './ui/button';

type CopyState = 'copied' | 'idle' | 'error';

export default function CopyEventButton({
  eventId,
  clerkUserId,
  ...buttonProps
}: Omit<ButtonProps, 'children' | 'onClick'> & {
  eventId: string;
  clerkUserId: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>('idle');

  return (
    <Button
      {...buttonProps}
      onClick={() => {
        navigator.clipboard
          .writeText(`${location.origin}/book/${clerkUserId}/${eventId}`)
          .then(() => {
            setCopyState('copied');
            setTimeout(() => setCopyState('idle'), 1000);
          })
          .catch(() => {
            setCopyState('error');
            setTimeout(() => setCopyState('idle'), 1000);
          });
      }}
    >
      {renderChildren(copyState)}
    </Button>
  );
}

function renderChildren(copyState: CopyState) {
  switch (copyState) {
    case 'idle':
      return (
        <>
          <Copy className="size-4 mr-2" />
          Copy Link
        </>
      );
    case 'copied':
      return (
        <>
          <CopyCheck className="size-4 mr-2" />
          Copied!
        </>
      );
    case 'error':
      return (
        <>
          <CopyX className="size-4 mr-2" />
          Error
        </>
      );
  }
}
