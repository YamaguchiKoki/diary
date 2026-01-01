import { CalendarIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { NavigationLink } from "@/components/ui/NavigationLink";
import { PROFILES } from "@/lib/constants";
import { routes } from "@/lib/routes";
import { getYearRange } from "@/lib/utils";

export const MenuContent = () => {
  const years = getYearRange();

  return (
    <div className="flex w-full flex-col text-sm">
      <div className="flex flex-col gap-4">
        <Link
          href={routes.home()}
          className="link-card inline-flex items-center gap-2 p-2"
        >
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight">
              preciouslove.com
            </span>
            <span className="text-gray-600">preciousloveの個人サイト</span>
          </div>
        </Link>
        <div className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavigationLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
            />
          ))}
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-2 text-sm">
        <span className="px-2 text-xs leading-relaxed font-medium text-gray-600">
          Archives
        </span>
        <div className="flex flex-col gap-1">
          {years.map((year) => (
            <NavigationLink
              key={year}
              href={routes.posts.year(year)}
              label={`${year}`}
              icon={<CalendarIcon size={16} />}
            />
          ))}
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-2 text-sm">
        <span className="px-2 text-xs leading-relaxed font-medium text-gray-600">
          Online
        </span>
        <div className="flex flex-col gap-1">
          {Object.values(PROFILES).map((profile) => (
            <NavigationLink
              key={profile.url}
              href={profile.url}
              label={profile.title}
              icon={profile.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LINKS = [
  {
    href: routes.home(),
    label: "Home",
    icon: <SparklesIcon size={16} />,
  },
];

export const MenuSkeleton = () => {
  return (
    <div className="flex w-full flex-col text-sm gap-4 p-2">
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
      <hr />
      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  );
};
