import * as React from "react";

type ViewTransitionComponent = React.ComponentType<{
  name?: string;
  children: React.ReactNode;
}>;

const ReactWithViewTransition = React as unknown as {
  ViewTransition?: ViewTransitionComponent;
  unstable_ViewTransition?: ViewTransitionComponent;
};

const NativeViewTransition =
  ReactWithViewTransition.ViewTransition ??
  ReactWithViewTransition.unstable_ViewTransition;

export interface MorphTransitionProps {
  name: string;
  children: React.ReactNode;
}

export function MorphTransition({ name, children }: MorphTransitionProps) {
  if (NativeViewTransition) {
    return <NativeViewTransition name={name}>{children}</NativeViewTransition>;
  }
  return <>{children}</>;
}