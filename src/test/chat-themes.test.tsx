import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChatThemeProvider, useChatTheme, parseChatTheme, chatThemeKey } from "@/components/chat/ChatThemeProvider";

function Probe() {
  const { theme, selectTheme } = useChatTheme();
  return <><output data-testid="theme">{theme}</output><button onClick={() => selectTheme("mint")}>Mint</button><button onClick={() => selectTheme("buzz")}>Buzz</button></>;
}
beforeEach(() => localStorage.clear());
afterEach(cleanup);
describe("Chat themes", () => {
  it("uses Buzz for missing and invalid preferences", () => {
    expect(parseChatTheme(null)).toBe("buzz");
    expect(parseChatTheme("unknown")).toBe("buzz");
    render(<ChatThemeProvider userId="one"><Probe /></ChatThemeProvider>);
    expect(screen.getByTestId("theme")).toHaveTextContent("buzz");
    expect(localStorage.getItem(chatThemeKey("one"))).toBeNull();
  });
  it("saves only an explicit selection and restores it after reopening", () => {
    const view = render(<ChatThemeProvider userId="one"><Probe /></ChatThemeProvider>);
    fireEvent.click(screen.getByText("Mint"));
    expect(localStorage.getItem(chatThemeKey("one"))).toBe("mint");
    view.unmount();
    render(<ChatThemeProvider userId="one"><Probe /></ChatThemeProvider>);
    expect(screen.getByTestId("theme")).toHaveTextContent("mint");
    fireEvent.click(screen.getByText("Buzz"));
    expect(localStorage.getItem(chatThemeKey("one"))).toBe("buzz");
  });
  it("keeps different accounts separate and synchronizes browser tabs", () => {
    localStorage.setItem(chatThemeKey("one"), "rose");
    const view = render(<ChatThemeProvider userId="one"><Probe /></ChatThemeProvider>);
    expect(screen.getByTestId("theme")).toHaveTextContent("rose");
    view.rerender(<ChatThemeProvider userId="two"><Probe /></ChatThemeProvider>);
    expect(screen.getByTestId("theme")).toHaveTextContent("buzz");
    act(() => {
      localStorage.setItem(chatThemeKey("two"), "midnight");
      window.dispatchEvent(new StorageEvent("storage", { key: chatThemeKey("two") }));
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("midnight");
  });
});