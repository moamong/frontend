import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "./App";
import { HomePage } from "../pages/HomePage";
import { RecordsPage } from "../pages/RecordsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StatisticsPage } from "../pages/StatisticsPage";
import { ROUTES } from "../constants/routes";

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.dashboard} replace />,
      },
      {
        path: ROUTES.dashboard,
        element: <HomePage />,
      },
      {
        path: ROUTES.records,
        element: <RecordsPage />,
      },
      {
        path: ROUTES.statistics,
        element: <StatisticsPage />,
      },
      {
        path: ROUTES.settings,
        element: <SettingsPage />,
      },
    ],
  },
]);
