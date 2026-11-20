import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface AppLocation {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

interface RouterValue extends AppLocation {
  navigate: (to: string, options?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

function readLocation(): AppLocation {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: window.history.state ?? null,
  };
}

function scrollToTarget(id: string, attempt = 0): void {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  // The target section may not be mounted yet (data still loading).
  if (attempt < 40) {
    window.setTimeout(() => scrollToTarget(id, attempt + 1), 50);
  }
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<AppLocation>(readLocation);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const url = new URL(to, window.location.origin);
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (next === current) {
      if (options.state !== undefined) {
        window.history.replaceState(options.state, '', next);
        setLocation(readLocation());
      }
      return;
    }

    if (options.replace) {
      window.history.replaceState(options.state ?? null, '', next);
    } else {
      window.history.pushState(options.state ?? null, '', next);
    }
    setLocation(readLocation());
  }, []);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      scrollToTarget(state.scrollTo);
    } else if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      if (id) {
        scrollToTarget(id);
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
    // Only react to URL changes, not to state object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash]);

  const value = useMemo<RouterValue>(
    () => ({ ...location, navigate }),
    [location, navigate],
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
};

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error('useRouter must be used inside <RouterProvider>');
  }
  return value;
}

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  state?: unknown;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({
  to,
  state,
  replace,
  onClick,
  children,
  ...rest
}) => {
  const { navigate } = useRouter();

  return (
    <a
      href={to}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        navigate(to, { state, replace });
      }}
      {...rest}
    >
      {children}
    </a>
  );
};

export function matchPath(
  pattern: string,
  pathname: string,
): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const expected = patternParts[i];
    const actual = pathParts[i];
    if (expected.startsWith(':')) {
      try {
        params[expected.slice(1)] = decodeURIComponent(actual);
      } catch {
        params[expected.slice(1)] = actual;
      }
    } else if (expected !== actual) {
      return null;
    }
  }
  return params;
}
