import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/#home",
    newTab: false,
  },
  {
    id: 2,
    title: "Features",
    newTab: false,
    submenu: [
      {
        id: 21,
        title: "All Features",
        path: "/features",
        newTab: false,
      },
      {
        id: 22,
        title: "Time Tracking",
        path: "/features/time-tracking",
        newTab: false,
      },
      {
        id: 23,
        title: "Quoting & Estimating",
        path: "/features/quoting-estimating",
        newTab: false,
      },
      {
        id: 24,
        title: "Job Scheduling",
        path: "/features/job-scheduling",
        newTab: false,
      },
      {
        id: 27,
        title: "Capacity Planning",
        path: "/features/capacity-planning",
        newTab: false,
      },
      {
        id: 28,
        title: "Mobile Access",
        path: "/features/mobile-access",
        newTab: false,
      },
      {
        id: 25,
        title: "Reporting & Dashboards",
        path: "/features/reporting-dashboards",
        newTab: false,
      },
      {
        id: 26,
        title: "Integrations",
        path: "/features/integrations",
        newTab: false,
      },
    ],
  },
  {
    id: 3,
    title: "Industries",
    path: "/#industries",
    newTab: false,
  },
  {
    id: 4,
    title: "Pricing",
    path: "/pricing",
    newTab: false,
  },
  {
    id: 5,
    title: "FAQ",
    newTab: false,
    path: "/#faq",
  },
];
export default menuData;
