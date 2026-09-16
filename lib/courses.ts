export interface Course {
  name: string;
  audience: string;
  url: string;
  image: string;
}

export const PRIMARY_COURSE: Course = {
  name: "El futuro de la IA",
  audience: "2 horas · en inglés · sin conocimientos técnicos",
  url: "https://bluedot.org/courses/future-of-ai",
  image: "/bluedot/future-of-ai.png",
};

export const SECONDARY_COURSES: Course[] = [
  {
    name: "Technical AI Safety",
    audience: "Para perfiles técnicos",
    url: "https://bluedot.org/courses/technical-ai-safety",
    image: "/bluedot/technical-ai-safety.png",
  },
  {
    name: "Frontier AI Governance",
    audience: "Para perfiles de política pública",
    url: "https://bluedot.org/courses/ai-governance",
    image: "/bluedot/frontier-ai-governance.png",
  },
];
