export interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    iconAlt: string;
  }
  
  export interface SectionProps {
    number: string;
    title: string;
    description: string;
    imageUrl?: string;
    imageAlt?: string;
  }
  
  export interface NavItemProps {
    label: string;
    href: string;
  }