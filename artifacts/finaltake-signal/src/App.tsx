import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { SignalProvider } from './use-signal-workspace';
import { BriefPage, EvidencePage, SearchPage, Shell } from './signal-ui';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } });

function NotFound() {
  return <div className="empty-run"><div className="eyebrow">404 / NOT IN THE WORKSPACE</div><h1 className="serif">This page isn't in the brief.</h1><p>Return to the need board to continue your search.</p><a className="btn-primary" href={import.meta.env.BASE_URL}>Back to need board</a></div>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function Routes() {
  return <Shell><RoutedErrorBoundary><Switch>
    <Route path="/" component={SearchPage} />
    <Route path="/evidence" component={EvidencePage} />
    <Route path="/brief" component={BriefPage} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary></Shell>;
}
function App() {
  return <QueryClientProvider client={queryClient}>
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <SignalProvider><Routes /></SignalProvider>
    </WouterRouter>
  </QueryClientProvider>;
}

export default App;