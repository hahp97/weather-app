import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: jest.fn().mockReturnValue("/"),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock Apollo client
jest.mock("@apollo/client", () => {
  const originalModule = jest.requireActual("@apollo/client");
  return {
    __esModule: true,
    ...originalModule,
    useMutation: jest
      .fn()
      .mockReturnValue([jest.fn(), { loading: false, error: null }]),
    useQuery: jest
      .fn()
      .mockReturnValue({ loading: false, error: null, data: null }),
  };
});
