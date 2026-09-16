'use client';

import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ReactNode } from "react";
import AppInitializer from "./AppInitializer";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="imperial-resort-theme"
      // scriptProps={{ 'data-no-flash': true }}  
    >
      <Provider store={store}>
        <AppInitializer />
        {children}
      </Provider>
    </ThemeProvider>
  );
}