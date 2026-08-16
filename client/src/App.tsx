import { Link, Route, Routes } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { EditEventPage } from "./pages/EditEventPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MyEventsPage } from "./pages/MyEventsPage";
import { MyTicketsPage } from "./pages/MyTicketsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PaymentCallbackPage } from "./pages/PaymentCallbackPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ScannerPage } from "./pages/ScannerPage";

function NotFoundPage() {
  return (
    <div className="container page">
      <div className="empty-state">
        <h3 className="empty-state-title">Page not found</h3>
        <p className="empty-state-text">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn--primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["EVENT_CREATOR"]} />}>
          <Route path="events/new" element={<CreateEventPage />} />
          <Route path="events/:id/edit" element={<EditEventPage />} />
          <Route path="events/:id/analytics" element={<AnalyticsPage />} />
          <Route path="my-events" element={<MyEventsPage />} />
          <Route path="scanner" element={<ScannerPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["EVENTEE"]} />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="my-tickets" element={<MyTicketsPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="payment/callback" element={<PaymentCallbackPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
