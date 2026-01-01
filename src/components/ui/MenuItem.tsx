import { CalendarIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavigationLink } from "@/components/ui/NavigationLink";
import { PROFILES } from "@/lib/constants";
import { routes } from "@/lib/routes";
import { getYearRange } from "@/lib/utils";

export const MenuContent = () => {
  const sections = getNavSections();

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
      </div>

      {sections.map((section) => (
        <div key={section.id}>
          <hr />
          <NavSection title={section.title} items={section.items} />
        </div>
      ))}
    </div>
  );
};

const NavSection = ({ title, items }: Omit<NavSection, "id">) => (
  <div className="flex flex-col gap-2 text-sm">
    {title && (
      <span className="px-2 text-xs leading-relaxed font-medium text-gray-600">
        {title}
      </span>
    )}
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <NavigationLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
        />
      ))}
    </div>
  </div>
);

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type NavSection = {
  id: string;
  title?: string;
  items: NavItem[];
};

const getNavSections = (): NavSection[] => {
  const years = getYearRange();

  return [
    {
      id: "main",
      items: [
        {
          href: routes.home(),
          label: "Home",
          icon: <SparklesIcon size={16} />,
        },
      ],
    },
    {
      id: "archives",
      title: "Archives",
      items: years.map((year) => ({
        href: routes.posts.year(year),
        label: `${year}`,
        icon: <CalendarIcon size={16} />,
      })),
    },
    {
      id: "online",
      title: "Online",
      items: Object.values(PROFILES).map((profile) => ({
        href: profile.url,
        label: profile.title,
        icon: profile.icon,
      })),
    },
  ];
};

const SKELETON_SECTIONS = [
  { id: "main", itemCount: 1 },
  { id: "archives", itemCount: 3 },
  { id: "online", itemCount: 2 },
] as const;

export const MenuSkeleton = () => (
  <div className="flex w-full flex-col text-sm">
    <div className="p-2">
      <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
    </div>
    {SKELETON_SECTIONS.map((section) => (
      <div key={section.id}>
        <hr />
        <div className="flex flex-col gap-2 py-2">
          <div className="h-4 w-16 bg-gray-100 rounded mx-2 animate-pulse" />
          <div className="flex flex-col gap-1">
            {Array.from({ length: section.itemCount }).map((_, i) => (
              <div
                key={`${section.id}-skeleton-${i}`}
                className="h-10 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);
