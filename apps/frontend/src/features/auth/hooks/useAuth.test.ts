import { expect, it, describe, mock, beforeEach } from "bun:test";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./useAuth";

/* better-auth/react と lib/auth のモック化 */
const mockSignIn = { social: mock() };
const mockSignOut = mock();
const mockUseSession = mock();

mock.module("@/lib/auth", () => ({
  useSession: mockUseSession,
  signIn: mockSignIn,
  signOut: mockSignOut,
}));

/* window.location のモック化 */
Object.defineProperty(window, "location", {
  writable: true,
  value: { origin: "http://localhost:3000" },
});

describe("useAuth", () => {
  beforeEach(() => {
    mockSignIn.social.mockClear();
    mockSignOut.mockClear();
    mockUseSession.mockClear();
  });

  it("isPending が true の場合、ローディング状態を返すこと", () => {
    /* ## Arrange ## */
    mockUseSession.mockReturnValue({ data: null, isPending: true });

    /* ## Act ## */
    const { result } = renderHook(() => useAuth());

    /* ## Assert ## */
    expect(result.current.isPending).toBe(true);
    expect(result.current.session).toBeNull();
  });

  it("ログイン済みの場合、セッション情報を返すこと", () => {
    /* ## Arrange ## */
    const mockSession = {
      user: { name: "田中 太郎", image: null, id: "u1", email: "test@example.com", emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
      session: { id: "s1", userId: "u1", expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date(), token: "tok" },
    };
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });

    /* ## Act ## */
    const { result } = renderHook(() => useAuth());

    /* ## Assert ## */
    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isPending).toBe(false);
  });

  it("未ログインの場合、session が null で返ること", () => {
    /* ## Arrange ## */
    mockUseSession.mockReturnValue({ data: null, isPending: false });

    /* ## Act ## */
    const { result } = renderHook(() => useAuth());

    /* ## Assert ## */
    expect(result.current.session).toBeNull();
  });

  it("handleSignIn を呼び出した際、Googleプロバイダーでサインインが実行されること", () => {
    /* ## Arrange ## */
    mockUseSession.mockReturnValue({ data: null, isPending: false });
    const { result } = renderHook(() => useAuth());

    /* ## Act ## */
    act(() => {
      result.current.handleSignIn();
    });

    /* ## Assert ## */
    expect(mockSignIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "http://localhost:3000/",
    });
  });

  it("handleSignOut を呼び出した際、signOut が実行されること", () => {
    /* ## Arrange ## */
    const mockSession = {
      user: { name: "田中 太郎", image: null, id: "u1", email: "test@example.com", emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
      session: { id: "s1", userId: "u1", expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date(), token: "tok" },
    };
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });
    const { result } = renderHook(() => useAuth());

    /* ## Act ## */
    act(() => {
      result.current.handleSignOut();
    });

    /* ## Assert ## */
    expect(mockSignOut).toHaveBeenCalled();
  });
});
