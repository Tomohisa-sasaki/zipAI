
export type Language = 'en' | 'jp';

export interface LocalizedString {
  en: string;
  jp: string;
}

export interface TimelineItem {
  year: string;
  title: LocalizedString;
  organization: string;
  description?: LocalizedString;
}

export interface ProjectItem {
  id: number;
  title: string;
  desc: LocalizedString;
  tags: string[];
  color: string;
}

export interface ProfileData {
  id: string;
  name: string;
  nameJp: string;
  title: LocalizedString;
  role: LocalizedString;
  image: string; // URL or path
  themeColor: string; // Tailwind color class prefix or hex
  themeGradient: string;
  keywords: string[];
  summary: LocalizedString;
  timeline: TimelineItem[];
  projects: ProjectItem[];
  links: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

export interface ResearchTopic {
  id: string;
  title: LocalizedString;
  category: string;
  description: LocalizedString;
  tags: string[];
}

export interface Member {
  id: string;
  name: string; // In English usually
  nameJp?: string;
  role: LocalizedString;
  affiliation: string;
  image?: string;
}

export interface NavLink {
  label: LocalizedString;
  path: string;
}

// Augment the global JSX namespace to include Three.js elements used by @react-three/fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Objects
      group: any;
      mesh: any;
      lineSegments: any;
      points: any;
      instancedMesh: any;

      // Geometries
      sphereGeometry: any;
      boxGeometry: any;
      cylinderGeometry: any;
      dodecahedronGeometry: any;
      ringGeometry: any;
      bufferGeometry: any;
      icosahedronGeometry: any;
      planeGeometry: any;
      coneGeometry: any;
      capsuleGeometry: any;

      // Materials
      meshBasicMaterial: any;
      pointsMaterial: any;
      meshPhysicalMaterial: any;
      shaderMaterial: any;
      lineBasicMaterial: any;
      meshStandardMaterial: any;

      // Lights
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      spotLight: any;

      // Attributes & Utils
      bufferAttribute: any;
      color: any;
      fog: any;
    }
  }
}