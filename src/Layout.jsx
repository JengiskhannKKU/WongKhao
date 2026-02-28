import FluidNavBar from "@/components/ui/FluidNavBar";

const navItems = [
  { path: "home", icon: "home", label: "หน้าแรก" },
  { path: "discover", icon: "explore", label: "ค้นหา" },
  { path: "MealPlan", icon: "calendar_month", label: "แผนอาหาร" },
  { path: "community", icon: "group", label: "ชุมชน" },
  { path: "profile", icon: "person", label: "โปรไฟล์" },
];

export default function Layout({ children, currentPageName }) {
  const hideNav = [
    "Onboarding",
    "Recommendation",
    "Login",
    "Register",
  ].includes(currentPageName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-white">
      <main className={!hideNav ? "pb-20" : ""}>{children}</main>

      {!hideNav && (
        <FluidNavBar navItems={navItems} currentPageName={currentPageName} />
      )}
    </div>
  );
}
