export type CourseConfig = {
  slug: string;
  name: string;
  holes: number;
  par?: number[];
  theme?: {
    primarySoft?: string;
    primary?: string;
    accent?: string;
    bg?: string;
    surface?: string;
  };
};

export const courses: CourseConfig[] = [
  {
    slug: "porirua-fun-putt",
    name: "Porirua Fun Putt",
    holes: 18,
    par: [2, 3, 2, 4, 3, 3, 2, 4, 3, 3, 2, 4, 3, 3, 2, 4, 3, 3],
    theme: {
      primary: "#fbbf24",
      primarySoft: "#fef3c7",
      accent: "#facc15"
    }
  },
  {
    slug: "harbor-lights",
    name: "Harbor Lights Mini Golf",
    holes: 12,
    par: [3, 3, 2, 4, 2, 3, 3, 4, 2, 3, 3, 2],
    theme: {
      bg: "#0a1a2f",
      surface: "#0f243e",
      primary: "#fbbf24",
      primarySoft: "#fef3c7",
      accent: "#facc15"
    }
  },
  {
    slug: "desert-dunes",
    name: "Desert Dunes",
    holes: 9,
    par: [2, 3, 2, 3, 3, 4, 2, 3, 4],
    theme: {
      bg: "#1a1308",
      surface: "#241409",
      primary: "#fbbf24",
      primarySoft: "#fef3c7",
      accent: "#facc15"
    }
  }
];

export function findCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}
