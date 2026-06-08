import React, { type ReactNode } from 'react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type TestWrapperProps = {
  children: ReactNode;
  initialEntries?: MemoryRouterProps['initialEntries'];
  initialIndex?: MemoryRouterProps['initialIndex'];
  globalMock?: Record<string, unknown>;
};

const GlobalTestContext = React.createContext<Record<string, unknown> | undefined>(undefined);

export function TestWrapper({
  children,
  initialEntries,
  initialIndex,
  globalMock = {},
}: TestWrapperProps) {
  return (
    <GlobalTestContext.Provider value={globalMock}>
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        {children}
      </MemoryRouter>
    </GlobalTestContext.Provider>
  );
}

export default TestWrapper;
