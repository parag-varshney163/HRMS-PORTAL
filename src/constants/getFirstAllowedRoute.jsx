export const getFirstAllowedRoute = (permissions) => {
  if (!permissions) return "/dashboard"; // fallback

  const routePriority = [
    { key: "recentTrends", route: "/recentTrend" },
    { key: "creators", route: "/creators" },
    { key: "applications", route: "/application" },
    { key: "kycReview", route: "/kycReviews" },
    { key: "userAnalytics", route: "/userAnalytics" },
    { key: "payouts", route: "/payouts" },
    { key: "payoutRequest", route: "/payoutRequest" },
  ];

  const mainSection = permissions["creatorOnboardingPayoutsDashboard"];

  if (!mainSection) return "/dashboard";

  for (let item of routePriority) {
    if (mainSection[item.key] === true) {
      return item.route;
    }
  }

  return "/dashboard"; // default
};
