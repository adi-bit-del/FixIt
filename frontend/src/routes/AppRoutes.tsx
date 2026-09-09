import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

/* ============================================================================
 * PUBLIC
 * ========================================================================== */

import LandingPage from "../features/home/LandingPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";

/* ============================================================================
 * CUSTOMER
 * ========================================================================== */

import CustomerDashboard from "../features/customer/CustomerDashboard";
import ServicesPage from "../features/customer/ServicesPage";
import ProfessionalDiscoveryPage from "../features/customer/ProfessionalDiscoveryPage";
import RequestServicePage from "../features/customer/RequestServicePage";
import CustomerRequestsPage from "../features/customer/CustomerRequestsPage";
import RequestDetailsPage from "../features/customer/RequestDetailsPage";
import CustomerQuotesPage from "../features/customer/CustomerQuotesPage";
import CustomerBookingsPage from "../features/customer/CustomerBookingsPage";
import CustomerPaymentsPage from "../features/customer/CustomerPaymentsPage";
import CustomerReviewsPage from "../features/customer/CustomerReviewsPage";
import CustomerProfilePage from "../features/customer/CustomerProfilePage";
import CustomerSettingsPage from "../features/customer/CustomerSettingsPage";
import CustomerNotificationsPage from "../features/customer/CustomerNotificationsPage";

import CustomerLayout from "../layout/CustomerLayout";

/* ============================================================================
 * PROFESSIONAL
 * ========================================================================== */

import ProfessionalLayout from "../layout/ProfessionalLayout";
import ProfessionalDashboardPage from "../features/professional/ProfessionalDashboardPage";
import ProfessionalRequestsPage from "../features/professional/ProfessionalRequestsPage";
import ProfessionalQuotesPage from "../features/professional/ProfessionalQuotesPage";
import ProfessionalBookingsPage from "../features/professional/ProfessionalBookingsPage";
import ProfessionalServicesPage from "../features/professional/ProfessionalServicesPage";
import ProfessionalServiceAreasPage from "../features/professional/ProfessionalServiceAreasPage";
import ProfessionalReviewsPage from "../features/professional/ProfessionalReviewsPage";
import ProfessionalProfilePage from "../features/professional/ProfessionalProfilePage";

/* ============================================================================
 * ADMIN
 * ========================================================================== */

import AdminLayout from "../layout/AdminLayout";
import AdminDashboardPage from "../features/admin/AdminDashboardPage";
import AdminProfessionalsPage from "../features/admin/AdminProfessionalsPage";
import AdminCustomersPage from "../features/admin/AdminCustomersPage";
import AdminCategoriesPage from "../features/admin/AdminCategoriesPage";
import AdminServicesPage from "../features/admin/AdminServicesPage";
import AdminReviewsPage from "../features/admin/AdminReviewsPage";
import AdminRequestsPage from "../features/admin/AdminRequestsPage";
import AdminQuotesPage from "../features/admin/AdminQuotesPage";
import AdminBookingsPage from "../features/admin/AdminBookingsPage";
import AdminPaymentsPage from "../features/admin/AdminPaymentsPage";
import AdminProfilePage from "../features/admin/AdminProfilePage";
import AdminSettingsPage from "../features/admin/AdminSettingsPage";

/* ============================================================================
 * ROUTE PROTECTION
 * ========================================================================== */

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ====================================================================
         * PUBLIC ROUTES
         * ================================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        {/* ====================================================================
         * CUSTOMER
         * ================================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["CUSTOMER"]}
            />
          }
        >
          <Route
            path="/customer"
            element={<CustomerLayout />}
          >
            <Route
              index
              element={<CustomerDashboard />}
            />

            <Route
              path="services"
              element={<ServicesPage />}
            />

            <Route
              path="professionals"
              element={<ProfessionalDiscoveryPage />}
            />

            <Route
              path="professionals/:professionalId/request"
              element={<RequestServicePage />}
            />

            <Route
              path="requests"
              element={<CustomerRequestsPage />}
            />

            <Route
              path="requests/:requestId"
              element={<RequestDetailsPage />}
            />

            <Route
              path="quotes"
              element={<CustomerQuotesPage />}
            />

            <Route
              path="bookings"
              element={<CustomerBookingsPage />}
            />

            <Route
              path="payments"
              element={<CustomerPaymentsPage />}
            />

            <Route
              path="reviews"
              element={<CustomerReviewsPage />}
            />

            <Route
              path="profile"
              element={<CustomerProfilePage />}
            />

            <Route
              path="settings"
              element={<CustomerSettingsPage />}
            />

            <Route
              path="notifications"
              element={<CustomerNotificationsPage />}
            />
          </Route>
        </Route>

        {/* ====================================================================
         * PROFESSIONAL
         * ================================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["PROFESSIONAL"]}
            />
          }
        >
          <Route
            path="/professional"
            element={<ProfessionalLayout />}
          >
            <Route
              index
              element={<ProfessionalDashboardPage />}
            />

            <Route
              path="requests"
              element={<ProfessionalRequestsPage />}
            />

            <Route
              path="quotes"
              element={<ProfessionalQuotesPage />}
            />

            <Route
              path="bookings"
              element={<ProfessionalBookingsPage />}
            />

            <Route
              path="services"
              element={<ProfessionalServicesPage />}
            />

            <Route
              path="service-areas"
              element={<ProfessionalServiceAreasPage />}
            />

            <Route
              path="reviews"
              element={<ProfessionalReviewsPage />}
            />

            <Route
              path="profile"
              element={<ProfessionalProfilePage />}
            />
          </Route>
        </Route>

        {/* ====================================================================
         * ADMIN
         * ================================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminDashboardPage />}
            />

            <Route
              path="professionals"
              element={<AdminProfessionalsPage />}
            />

            <Route
              path="customers"
              element={<AdminCustomersPage />}
            />

            <Route
              path="requests"
              element={<AdminRequestsPage />}
            />

            <Route
              path="quotes"
              element={<AdminQuotesPage />}
            />

            <Route
              path="bookings"
              element={<AdminBookingsPage />}
            />

            <Route
              path="payments"
              element={<AdminPaymentsPage />}
            />

            <Route
              path="categories"
              element={<AdminCategoriesPage />}
            />

            <Route
              path="services"
              element={<AdminServicesPage />}
            />

            <Route
              path="reviews"
              element={<AdminReviewsPage />}
            />

            <Route
              path="profile"
              element={<AdminProfilePage />}
            />

            <Route
              path="settings"
              element={<AdminSettingsPage />}
            />
          </Route>
        </Route>

        {/* ====================================================================
         * FALLBACK
         * ================================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}